package main

import (
	"database/sql"
	"time"

	"strconv"

	"github.com/gofiber/fiber/v2"
)

// helper atoi
func atoi(s string) int {
	val, _ := strconv.Atoi(s)
	return val
}

// =======================================
// CRUD ProfitLoss
// =======================================

// GET all
func getAllProfitLoss(c *fiber.Ctx) error {
	req := new(struct {
		UserID int `json:"userID"`
	})
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid input"})
	}

	rows, err := db.Query(`
        SELECT id, date, revenue, expense, profitloss 
        FROM profit_losses 
        WHERE user_id = ? 
        ORDER BY date DESC
    `, req.UserID)
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
	err := db.QueryRow("SELECT id, date, revenue, expense, profitloss FROM profit_losses WHERE id = ?", id).
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

	// validasi user_id
	if pl.UserID == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "user_id is required"})
	}

	var exists int
	err := db.QueryRow("SELECT COUNT(*) FROM profit_losses WHERE date = ?", pl.Date).Scan(&exists)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	if exists > 0 {
		return c.Status(400).JSON(fiber.Map{"error": "date already exists"})
	}

	pl.ProfitLoss = pl.Revenue - pl.Expense
	res, err := db.Exec("INSERT INTO profit_losses (user_id, date, revenue, expense, profitloss) VALUES (?, ?, ?, ?, ?)",
		pl.UserID, pl.Date, pl.Revenue, pl.Expense, pl.ProfitLoss)
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
	pl.ProfitLoss = pl.Revenue - pl.Expense
	_, err := db.Exec("UPDATE profit_losses SET date=?, revenue=?, expense=?, profitloss=? WHERE id=?",
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
	_, err := db.Exec("DELETE FROM profit_losses WHERE id=?", id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "deleted"})
}

// GET stats (sama seperti yang sebelumnya)
func getProfitLossStats(c *fiber.Ctx) error {
	req := new(StatsRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid input"})
	}

	rows, err := db.Query(`
        SELECT id, date, revenue, expense, profitloss 
        FROM profit_losses 
        WHERE user_id = ? 
        ORDER BY date ASC
    `, req.UserID)
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

	yearlyRevenue := make(map[string]float64)
	yearlyExpense := make(map[string]float64)
	yearlyProfitloss := make(map[string]float64)

	// insight tambahan
	var totalRevenue, totalExpense, totalProfit float64
	var maxRevenue, maxExpense, maxProfit float64
	var minRevenue, minExpense, minProfit float64
	minRevenue, minExpense, minProfit = 999999999, 999999999, 999999999

	// tanggal hari ini
	now := time.Now()
	currentYear, currentMonth, _ := now.Date()
	loc := now.Location()

	// range daily (bulan ini)
	firstDay := time.Date(currentYear, currentMonth, 1, 0, 0, 0, 0, loc)
	lastDay := firstDay.AddDate(0, 1, -1)

	for rows.Next() {
		var pl ProfitLoss
		var dateStr string
		if err := rows.Scan(&pl.ID, &dateStr, &pl.Revenue, &pl.Expense, &pl.ProfitLoss); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		// parsing tanggal
		t, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "invalid date format"})
		}

		pl.Date = dateStr
		result = append(result, pl)

		// daily (hanya bulan ini)
		if !t.Before(firstDay) && !t.After(lastDay) {
			dayKey := t.Format("2006-01-02")
			dailyRevenue[dayKey] += pl.Revenue
			dailyExpense[dayKey] += pl.Expense
			dailyProfitloss[dayKey] += pl.ProfitLoss
		}

		// monthly (hanya tahun ini)
		if t.Year() == currentYear {
			monthKey := t.Format("January 2006") // contoh: January 2025
			monthlyRevenue[monthKey] += pl.Revenue
			monthlyExpense[monthKey] += pl.Expense
			monthlyProfitloss[monthKey] += pl.ProfitLoss
		}

		// yearly (semua tahun)
		yearKey := t.Format("2006")
		yearlyRevenue[yearKey] += pl.Revenue
		yearlyExpense[yearKey] += pl.Expense
		yearlyProfitloss[yearKey] += pl.ProfitLoss

		// total
		totalRevenue += pl.Revenue
		totalExpense += pl.Expense
		totalProfit += pl.ProfitLoss

		// max & min
		if pl.Revenue > maxRevenue {
			maxRevenue = pl.Revenue
		}
		if pl.Revenue < minRevenue {
			minRevenue = pl.Revenue
		}
		if pl.Expense > maxExpense {
			maxExpense = pl.Expense
		}
		if pl.Expense < minExpense {
			minExpense = pl.Expense
		}
		if pl.ProfitLoss > maxProfit {
			maxProfit = pl.ProfitLoss
		}
		if pl.ProfitLoss < minProfit {
			minProfit = pl.ProfitLoss
		}
	}

	// isi daily kosong (bulan ini)
	for d := firstDay; !d.After(lastDay); d = d.AddDate(0, 0, 1) {
		dayKey := d.Format("2006-01-02")
		if _, ok := dailyRevenue[dayKey]; !ok {
			dailyRevenue[dayKey] = 0
			dailyExpense[dayKey] = 0
			dailyProfitloss[dayKey] = 0
		}
	}

	// isi monthly kosong (Januari–Desember tahun ini)
	for m := 1; m <= 12; m++ {
		d := time.Date(currentYear, time.Month(m), 1, 0, 0, 0, 0, loc)
		monthKey := d.Format("January 2006")
		if _, ok := monthlyRevenue[monthKey]; !ok {
			monthlyRevenue[monthKey] = 0
			monthlyExpense[monthKey] = 0
			monthlyProfitloss[monthKey] = 0
		}
	}

	// konversi monthly ke slice agar urut
	type MonthlyStat struct {
		Month      string  `json:"month"`
		Revenue    float64 `json:"revenue"`
		Expense    float64 `json:"expense"`
		ProfitLoss float64 `json:"profitloss"`
	}
	var monthlyStats []MonthlyStat
	for m := 1; m <= 12; m++ {
		d := time.Date(currentYear, time.Month(m), 1, 0, 0, 0, 0, loc)
		monthKey := d.Format("January 2006")
		monthlyStats = append(monthlyStats, MonthlyStat{
			Month:      monthKey,
			Revenue:    monthlyRevenue[monthKey],
			Expense:    monthlyExpense[monthKey],
			ProfitLoss: monthlyProfitloss[monthKey],
		})
	}

	// insight tambahan: rata-rata harian (bulan ini saja)
	daysCount := len(dailyRevenue)
	avgRevenue := 0.0
	avgExpense := 0.0
	avgProfit := 0.0
	if daysCount > 0 {
		avgRevenue = totalRevenue / float64(daysCount)
		avgExpense = totalExpense / float64(daysCount)
		avgProfit = totalProfit / float64(daysCount)
	}

	return c.JSON(fiber.Map{
		"data":             result,
		"dailyRevenue":     dailyRevenue,
		"dailyExpense":     dailyExpense,
		"dailyProfitloss":  dailyProfitloss,
		"monthlyStats":     monthlyStats, // sudah urut Jan–Dec
		"yearlyRevenue":    yearlyRevenue,
		"yearlyExpense":    yearlyExpense,
		"yearlyProfitloss": yearlyProfitloss,
		"avgRevenue":       avgRevenue,
		"avgExpense":       avgExpense,
		"avgProfit":        avgProfit,
		"maxRevenue":       maxRevenue,
		"minRevenue":       minRevenue,
		"maxExpense":       maxExpense,
		"minExpense":       minExpense,
		"maxProfit":        maxProfit,
		"minProfit":        minProfit,
	})
}
