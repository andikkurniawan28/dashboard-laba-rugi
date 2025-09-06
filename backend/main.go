package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"strconv"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

type ProfitLoss struct {
	ID         int     `json:"id"`
	Date       string  `json:"date"`
	Revenue    float64 `json:"revenue"`
	Expense    float64 `json:"expense"`
	ProfitLoss float64 `json:"profitloss"`
}

var db *sql.DB

func main() {
	var err error
	// 🔑 sesuaikan DSN (jika tanpa password tulis root@tcp...)
	dsn := "root:@tcp(127.0.0.1:3306)/pld"
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	app := fiber.New()
	app.Use(cors.New())

	// =========================
	// 📊 Endpoint Stats
	// =========================
	app.Get("/api/profitloss/stats", getProfitLossStats)

	// =========================
	// 🛠 CRUD Endpoints
	// =========================
	app.Get("/api/profitloss/stats", getProfitLossStats) // Stats
	app.Get("/api/profitloss", getAllProfitLoss)         // READ all
	app.Get("/api/profitloss/:id", getProfitLossByID)    // READ one
	app.Post("/api/profitloss", createProfitLoss)        // CREATE
	app.Put("/api/profitloss/:id", updateProfitLoss)     // UPDATE
	app.Delete("/api/profitloss/:id", deleteProfitLoss)  // DELETE

	log.Fatal(app.Listen(":3001"))
}

// =======================================
// 📊 GET profitloss/stats
// =======================================
func getProfitLossStats(c *fiber.Ctx) error {
	rows, err := db.Query("SELECT id, date, revenue, expense, profitloss FROM profitloss ORDER BY date ASC")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	defer rows.Close()

	var result []ProfitLoss
	dailyRevenue := make(map[string]float64)
	dailyExpense := make(map[string]float64)
	dailyProfitloss := make(map[string]float64)

	monthlyRevenue := make(map[string]float64)
	monthlyExpense := make(map[string]float64)
	monthlyProfitloss := make(map[string]float64)

	for rows.Next() {
		var pl ProfitLoss
		var dateStr string
		if err := rows.Scan(&pl.ID, &dateStr, &pl.Revenue, &pl.Expense, &pl.ProfitLoss); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		pl.Date = dateStr
		result = append(result, pl)

		// daily
		dailyRevenue[dateStr] += pl.Revenue
		dailyExpense[dateStr] += pl.Expense
		dailyProfitloss[dateStr] += pl.ProfitLoss

		// monthly
		monthKey := dateStr[:7]
		monthlyRevenue[monthKey] += pl.Revenue
		monthlyExpense[monthKey] += pl.Expense
		monthlyProfitloss[monthKey] += pl.ProfitLoss
	}

	// Tambahkan tanggal kosong bulan sekarang
	now := time.Now()
	year, month, _ := now.Date()
	loc := now.Location()
	firstDay := time.Date(year, month, 1, 0, 0, 0, 0, loc)
	lastDay := firstDay.AddDate(0, 1, -1)

	for d := firstDay; !d.After(lastDay); d = d.AddDate(0, 0, 1) {
		dateKey := d.Format("2006-01-02")
		if _, ok := dailyRevenue[dateKey]; !ok {
			dailyRevenue[dateKey] = 0
			dailyExpense[dateKey] = 0
			dailyProfitloss[dateKey] = 0
		}
	}

	// Tambahkan bulan kosong (Januari–Desember tahun ini)
	for m := 1; m <= 12; m++ {
		monthKey := fmt.Sprintf("%04d-%02d", year, m)
		if _, ok := monthlyRevenue[monthKey]; !ok {
			monthlyRevenue[monthKey] = 0
			monthlyExpense[monthKey] = 0
			monthlyProfitloss[monthKey] = 0
		}
	}

	return c.JSON(fiber.Map{
		"data":              result,
		"dailyRevenue":      dailyRevenue,
		"dailyExpense":      dailyExpense,
		"dailyProfitloss":   dailyProfitloss,
		"monthlyRevenue":    monthlyRevenue,
		"monthlyExpense":    monthlyExpense,
		"monthlyProfitloss": monthlyProfitloss,
	})
}

// =======================================
// CRUD Functions
// =======================================

// GET all
func getAllProfitLoss(c *fiber.Ctx) error {
	rows, err := db.Query("SELECT id, date, revenue, expense, profitloss FROM profitloss ORDER BY date DESC")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	defer rows.Close()

	var result []ProfitLoss
	for rows.Next() {
		var pl ProfitLoss
		if err := rows.Scan(&pl.ID, &pl.Date, &pl.Revenue, &pl.Expense, &pl.ProfitLoss); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		result = append(result, pl)
	}
	return c.JSON(result)
}

// GET by ID
func getProfitLossByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var pl ProfitLoss
	err := db.QueryRow("SELECT id, date, revenue, expense, profitloss FROM profitloss WHERE id = ?", id).
		Scan(&pl.ID, &pl.Date, &pl.Revenue, &pl.Expense, &pl.ProfitLoss)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.Status(404).JSON(fiber.Map{"error": "not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(pl)
}

// CREATE
func createProfitLoss(c *fiber.Ctx) error {
	pl := new(ProfitLoss)
	if err := c.BodyParser(pl); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid input"})
	}

	// Validasi unik per tanggal
	var exists int
	err := db.QueryRow("SELECT COUNT(*) FROM profitloss WHERE date = ?", pl.Date).Scan(&exists)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	if exists > 0 {
		return c.Status(400).JSON(fiber.Map{"error": "date already exists"})
	}

	// Hitung profitloss otomatis
	pl.ProfitLoss = pl.Revenue - pl.Expense

	res, err := db.Exec("INSERT INTO profitloss (date, revenue, expense, profitloss) VALUES (?, ?, ?, ?)",
		pl.Date, pl.Revenue, pl.Expense, pl.ProfitLoss)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	id, _ := res.LastInsertId()
	pl.ID = int(id)
	return c.JSON(pl)
}

// UPDATE
func updateProfitLoss(c *fiber.Ctx) error {
	id := c.Params("id")
	pl := new(ProfitLoss)
	if err := c.BodyParser(pl); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid input"})
	}

	// Hitung profitloss otomatis
	pl.ProfitLoss = pl.Revenue - pl.Expense

	_, err := db.Exec("UPDATE profitloss SET date=?, revenue=?, expense=?, profitloss=? WHERE id=?",
		pl.Date, pl.Revenue, pl.Expense, pl.ProfitLoss, id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	pl.ID = atoi(id)
	return c.JSON(pl)
}

// DELETE
func deleteProfitLoss(c *fiber.Ctx) error {
	id := c.Params("id")
	_, err := db.Exec("DELETE FROM profitloss WHERE id=?", id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "deleted"})
}

// helper atoi
func atoi(s string) int {
	val, _ := strconv.Atoi(s)
	return val
}
