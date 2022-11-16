import {writeJson} from 'https://deno.land/x/jsonfile/mod.ts';
import {MySqlClient} from "./database/mysql.connect.ts";
import {readJson} from "https://deno.land/x/jsonfile@1.0.0/read_json.ts";

const URL = "https://sheets.googleapis.com/v4/spreadsheets/1frVzuJCImzpP-zEhSrzuQGV0rUp3mFxV5OfG0z1UZYg/values/Dataset?key=AIzaSyAKvaEy7p0n7ATGr-XoCBuOpt7RDIudrAs";


const dataInitialSetup = async () => {


try {
    // const data = await fetch(URL).then(res => res.json());
    // await writeJson('./dataset.json', data.values, {spaces: 2});
    // Update local mysql server with new data

    // await writeJson('./dataset.json', data.values, {spaces: 2});
    let data: Array<[string,string,string,string,string,string,string,string,string]>  = await readJson('./dataset.json');
    const client = await MySqlClient().get();

    let initialTableSetting = await client.execute(`
            create table if not exists dataSet
                (
                    event_time    datetime                     null,
                    event_type    varchar(255) charset utf8mb3 null,
                    product_id    varchar(255) charset utf8mb3 null,
                    category_code int                          null,
                    category_id   varchar(255) charset utf8mb3 null,
                    brand         varchar(255) charset utf8mb3 null,
                    price         int                          null,
                    user_id       varchar(255) charset utf8mb3 null,
                    user_session  varchar(255) charset utf8mb3 null
                );
                
            `)

    console.log(initialTableSetting);


    for (let i = 1; i < data.length; i++) {
        let entry = data[i];
        let insert = await client.execute(`
            insert into dataSet(event_time,event_type, product_id,category_id , category_code, brand, price, user_id, user_session  ) 
            values (
                '${entry[0]}',
                '${entry[1]}',
                '${entry[2]}',
                '${entry[3]}',
                '${entry[4]}',
                '${entry[5]}',
                '${entry[6]}',
                '${entry[7]}',
                '${entry[8]}'
            )
        `)
        console.log("Inset Result: ", insert);
    }

} catch (error) {
    console.error(error);
}

}



dataInitialSetup();
