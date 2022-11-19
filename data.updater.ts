import {writeJson} from 'https://deno.land/x/jsonfile/mod.ts';
import {MySqlClient} from "./database/mysql.connect.ts";
import {readJson} from "https://deno.land/x/jsonfile@1.0.0/read_json.ts";
const GOOGLE_TOKEN = Deno.env.get("GOOGLE_TOKEN");

const URL = `https://sheets.googleapis.com/v4/spreadsheets/1frVzuJCImzpP-zEhSrzuQGV0rUp3mFxV5OfG0z1UZYg/values/Dataset?key=${GOOGLE_TOKEN}`;

export const init = async () => {


    try {
        // This is the data from the google sheet
        // Not actively used in the code, just for creating dataset.json

        // const remoteData = await fetch(URL).then(res => res.json());
        // await writeJson('./dataset.json', remoteData.values, {spaces: 2});
        // Update local mysql server with new data

        let data: Array<[string, string, string, string, string, string, string, string, string]> = await readJson('./dataset.json');
        const client = await MySqlClient().get();

        let initialTableSetting = await client.execute(`
            create table if not exists dataSet
                (
                    id int auto_increment primary key,
                    event_time    datetime                     null,
                    event_type    varchar(255) charset utf8mb3 null,
                    product_id    varchar(255) charset utf8mb3 null,
                    category_code varchar(255) charset utf8mb3 null,
                    category_id   varchar(255) charset utf8mb3 null,
                    brand         varchar(255) charset utf8mb3 null,
                    price         int                          null,
                    user_id       varchar(255) charset utf8mb3 null,
                    user_session  varchar(255) charset utf8mb3 null
                );

            `)

        let newData = [...data];
        let query = `
            insert into dataSet(event_time,event_type, product_id,category_id , category_code, brand, price, user_id, user_session  )
            values
        `
        for (let i = 1; i < newData.length; i++) {
            let entry = newData[i];
            try {

                query += ` (
                '${new Date(entry[0]).toISOString().split('T').join(" ").split('.')[0]}',
                '${entry[1]}',
                '${entry[2]}',
                '${entry[3]}',
                '${entry[4]}',
                '${entry[5]}',
                '${entry[6]}',
                '${entry[7]}',
                '${entry[8]}'
            )`;

                if (i !== newData.length - 1) {
                    query += `, `;
                }

                console.log("insert", i);

            } catch (e) {
                console.log(e);
            }


        }

        await client.execute(query);

        console.log("complete")
        Deno.exit(1)
    } catch (error) {
        console.error(error);
    }

}

