package main

import (
	"database/sql"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

// =======================================
// LOGIN PROCESS
// =======================================
func loginProcess(c *fiber.Ctx) error {
	req := new(LoginRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid input"})
	}

	var (
		user             User
		hashedPassword   string
		isActive         bool
		accessToProduct1 bool
	)

	// Ambil user berdasarkan email
	err := db.QueryRow(`
		SELECT id, role_id, name, email, password, is_active, access_to_product_1, organization, whatsapp
		FROM users 
		WHERE email = ?
		LIMIT 1
	`, req.Email).Scan(
		&user.ID, &user.RoleID, &user.Name, &user.Email,
		&hashedPassword, &isActive, &accessToProduct1,
		&user.Organization, &user.Whatsapp,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return c.Status(401).JSON(fiber.Map{"error": "invalid credentials"})
		}
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	// Cek apakah user aktif
	if !isActive {
		return c.Status(403).JSON(fiber.Map{"error": "user not active"})
	}

	// Cek apakah user punya akses ke produk 1
	if !accessToProduct1 {
		return c.Status(403).JSON(fiber.Map{"error": "user does not have access to this system"})
	}

	// Cek password bcrypt
	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.Password)); err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "invalid credentials"})
	}

	// Login sukses
	return c.JSON(fiber.Map{
		"message": "login success",
		"user":    user,
	})
}

// =======================================
// REGISTER PROCESS
// =======================================
func registerProcess(c *fiber.Ctx) error {
	type RegisterRequest struct {
		Organization string `json:"organization"`
		Name         string `json:"name"`
		Email        string `json:"email"`
		Whatsapp     string `json:"whatsapp"`
		Password     string `json:"password"`
	}

	req := new(RegisterRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid input"})
	}

	// cek email sudah terpakai atau belum
	var existing int
	err := db.QueryRow("SELECT COUNT(*) FROM users WHERE email = ?", req.Email).Scan(&existing)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	if existing > 0 {
		return c.Status(400).JSON(fiber.Map{"error": "email already registered"})
	}

	// hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to hash password"})
	}

	// insert user baru
	result, err := db.Exec(`
		INSERT INTO users (role_id, name, email, password, is_active, access_to_product_1, organization, whatsapp)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`,
		3, req.Name, req.Email, string(hashedPassword),
		1, 1, req.Organization, req.Whatsapp,
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	lastID, _ := result.LastInsertId()

	return c.JSON(fiber.Map{
		"message": "register success",
		"user": fiber.Map{
			"id":                  lastID,
			"role_id":             3,
			"name":                req.Name,
			"email":               req.Email,
			"organization":        req.Organization,
			"whatsapp":            req.Whatsapp,
			"is_active":           1,
			"access_to_product_1": 1,
		},
	})
}

// =======================================
// CHANGE PASSWORD PROCESS
// =======================================
func changePasswordProcess(c *fiber.Ctx) error {
	type ChangePasswordRequest struct {
		UserID          int    `json:"user_id"`
		CurrentPassword string `json:"currentPassword"`
		NewPassword     string `json:"newPassword"`
	}

	req := new(ChangePasswordRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid input"})
	}

	// Ambil password lama dari DB
	var hashedPassword string
	err := db.QueryRow("SELECT password FROM users WHERE id = ?", req.UserID).Scan(&hashedPassword)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.Status(404).JSON(fiber.Map{"error": "user not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	// Cek current password
	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.CurrentPassword)); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "current password is incorrect"})
	}

	// Hash password baru
	newHashed, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to hash new password"})
	}

	// Update ke DB
	_, err = db.Exec("UPDATE users SET password = ? WHERE id = ?", string(newHashed), req.UserID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "password updated successfully"})
}
