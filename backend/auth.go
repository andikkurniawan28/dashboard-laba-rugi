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
