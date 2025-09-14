import React from "react";

function ApiDocs() {
    // Ambil user dari localStorage (sama kayak di app React kamu)
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <div className="container-fluid my-5 px-5">
            <h2>API Documentation</h2>

            <h4>Create Profit/Loss Record</h4>
            <p>
                This endpoint is used to <b>add a new profit/loss record</b>.<br/>
                <b>Note:</b> The <code>user_id</code> and <code>app_key</code> below are <i>your user credentials</i> from when you logged in.
            </p>

            <pre className="bg-dark text-white p-3 rounded">
                {`POST ${process.env.REACT_APP_API_URL}/profitloss


Request Body (JSON):
{
  "user_id": ${user?.id || "<your_user_id>"},
  "app_key": "${user?.app_key || "<your_app_key>"}",
  "date": "2025-09-09",
  "revenue": 1000000,
  "expense": 500000
}

Response (JSON):
{
  "id": 12,
  "user_id": ${user?.id || "<your_user_id>"},
  "app_key": "${user?.app_key || "<your_app_key>"}",
  "date": "2025-09-09",
  "revenue": 1000000,
  "expense": 500000,
  "profitloss": 500000
}`}
            </pre>
        </div>
    );
}

export default ApiDocs;
