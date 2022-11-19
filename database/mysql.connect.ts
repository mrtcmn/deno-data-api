import * as mysql2 from "https://deno.land/x/mysql2/mod.ts";

const DB_HOST = Deno.env.get("DB_HOST");
const DB_USER = Deno.env.get("DB_USER");
const DB_DATABASE = Deno.env.get("DB_DATABASE");
const DB_PASSWORD = Deno.env.get("DB_PASSWORD");

export const MySqlClient = () => {
    let client;

    function getMySqlConnection() {
        client = mysql2.createConnection({
            host: DB_HOST,
            port: 3306,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_DATABASE,
        });

    }
    function get() {
        if (!client) {
            getMySqlConnection();
        }
        return client;
    }
    return {
        get
    }

}
