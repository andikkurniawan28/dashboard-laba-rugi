package main

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type User struct {
	ID           int    `json:"id"`
	RoleID       int    `json:"role_id"`
	Name         string `json:"name"`
	Email        string `json:"email"`
	Organization string `json:"organization"`
	Whatsapp     string `json:"whatsapp"`
}

type ProfitLoss struct {
	ID         int     `json:"id"`
	UserID     int     `json:"user_id"`
	Date       string  `json:"date"`
	Revenue    float64 `json:"revenue"`
	Expense    float64 `json:"expense"`
	ProfitLoss float64 `json:"profitloss"`
}

type StatsRequest struct {
	UserID int `json:"user_id"`
}

type UserRequest struct {
	UserID int64 `json:"user_id"`
}
