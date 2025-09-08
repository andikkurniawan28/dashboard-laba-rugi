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

	// ambil user dari db
	var user User
	var hashedPassword string
	var isActive bool

	err := db.QueryRow(`
		SELECT id, role_id, name, email, password, is_active, organization, whatsapp 
		FROM users WHERE email = ? LIMIT 1
	`, req.Email).Scan(&user.ID, &user.RoleID, &user.Name, &user.Email, &hashedPassword, &isActive, &user.Organization, &user.Whatsapp)

	if err != nil {
		if err == sql.ErrNoRows {
			return c.Status(401).JSON(fiber.Map{"error": "invalid credentials"})
		}
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	// cek aktif
	if !isActive {
		return c.Status(403).JSON(fiber.Map{"error": "user not active"})
	}

	// cek password bcrypt
	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.Password)); err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "invalid credentials"})
	}

	// login sukses
	return c.JSON(fiber.Map{
		"message": "login success",
		"user":    user,
	})
}
