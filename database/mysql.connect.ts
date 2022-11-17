import * as mysql2 from "https://deno.land/x/mysql2/mod.ts";


export const MySqlClient = () => {
    let client;

    function getMySqlConnection() {
        client = mysql2.createConnection({
            host: "localhost",
            port: 3306,
            user: "root",
            password: "testPass",
            database: "test",
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
