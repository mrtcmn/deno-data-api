import * as mysql2 from "https://deno.land/x/mysql2/mod.ts";


export const MySqlClient = () => {
    let client;

    function getMySqlConnection() {
        client = mysql2.createPool({
            host: "127.0.0.1",
            port: 3306,
            user: "root",
            password: "testPass",
            database: "dataSet",
            connectionLimit: 999999,
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
