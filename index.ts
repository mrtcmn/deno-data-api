import {Application, Router} from "https://deno.land/x/oak/mod.ts";
import {getQuery} from "https://deno.land/x/oak@v11.1.0/helpers.ts";
import {MySqlClient} from "./database/mysql.connect.ts";


const metricsAvailableFilters: { [key: string]: string } = {
    "revenue": {
        aggregate: ["avg"],
        dimensions: ["event_type", "product_id", "category_id", "category_code", "brand", "user_id", "user_session"],
    },
    "sessions": {
        aggregate: ["distinct"],
        dimensions: ["date.weeknum"],
    },
    "conversion": {
        aggregate: ["distinct"],
        dimensions: ["date"],
    },
    "net-revenue": {
        aggregate: ["sum"],
        dimensions: ["customer"],
    }
}

const checkIfValidFilter = (filter: string, id: string, whichMetric: string): boolean => {
    try {
        return metricsAvailableFilters[id][whichMetric].includes(filter);
    } catch (e) {
        return false;
    }
}


const numberRounderAndFormatter = (number: string): string => {
    try {
        return (Math.round(Number(number).toFixed(2) * 100) / 100).toFixed(2)
    } catch (e) {
        throw new Error("Invalid data type")
    }

}


const router = new Router();
router
    .get("/", (context) => {
        context.response.body = "Hello world!";
    })
    .get("/metrics", async (context) => {
        let allQueries = getQuery(context, {mergeParams: true});
        const {id, dimensions, aggregate, ...restFilters} = allQueries


        if (id === "revenue") {
            if (!(checkIfValidFilter(dimensions, id, "dimensions") && checkIfValidFilter(aggregate, id, "aggregate"))) {
                return context.response.body = "Invalid filter";
            }
            const client = await MySqlClient().get();
            let resultDb = await client.execute(`select avg(price) as averagePrice, brand from dataSet where event_type='purchase' group by ${dimensions}`);

            if (!(resultDb && resultDb.length > 0)) {
                return context.response.status = 404;
            }

            resultDb = resultDb[0].reduce((acc, dbItem) => {
                if (dbItem.brand === '') {
                    return acc;
                }
                return {
                    ...acc,
                    [dbItem.brand]: [{
                        value:
                            (Math.round(Number(dbItem.averagePrice).toFixed(2) * 100) / 100).toFixed(2)
                    }]
                }
            }, {})

            return context.response.body = {
                metric: id,
                dimensions: [dimensions],
                aggregation: aggregate,
                data: resultDb
            };
        }

        if (id === "sessions") {
            if (!(checkIfValidFilter(dimensions, id, "dimensions") && checkIfValidFilter(aggregate, id, "aggregate"))) {
                return context.response.body = "Invalid filter";
            }
            const client = await MySqlClient().get();

            // This query works with if first weekday is monday. Otherwise, change WEEK to WK.
            let resultDb = await client.execute(`
                select count(distinct user_session) as uniqueUserSession, weekT.week from dataSet mainT
                    inner join ( select EXTRACT(WEEK from event_time) as week, id from dataSet ) weekT on weekT.id =mainT.id
                    group by weekT.week
                    `);

            if (!(resultDb && resultDb.length > 0)) {
                return context.response.status = 404;
            }

            resultDb = resultDb[0].reduce((acc, dbItem) => {
                if (dbItem.brand === '') {
                    return acc;
                }
                return {
                    ...acc,
                    [dbItem.week]: [{
                        value: String(dbItem.uniqueUserSession)
                    }]
                }
            }, {})

            return context.response.body = {
                metric: id,
                dimensions: [dimensions],
                aggregation: aggregate,
                data: resultDb
            };
        }

        if (id === "conversion") {
            if (!(checkIfValidFilter(dimensions, id, "dimensions") && checkIfValidFilter(aggregate, id, "aggregate"))) {
                return context.response.body = "Invalid filter";
            }
            const client = await MySqlClient().get();

            // s
            let query = `
             select round(( calc.purchaseCount/calc.uniqueUserSession * 100 ),2) as conversionRate , calc.purchaseCount,calc.uniqueUserSession, calc.ymd from (select count(distinct user_session) as uniqueUserSession, count(distinct if(event_type = 'purchase', user_session, null) ) as purchaseCount, dayT.ymd from dataSet mainT
                inner join ( select DATE_FORMAT(event_time, '%Y-%m-%d') as ymd, id from dataSet ) dayT on dayT.id =mainT.id
                group by dayT.ymd) calc
             `;

            let resultDb = await client.execute(query);

            if (!(resultDb && resultDb.length > 0)) {
                return context.response.status = 404;
            }

            resultDb = resultDb[0].reduce((acc, dbItem) => {
                return {
                    ...acc,
                    [dbItem.ymd]: [{
                        sessions: Number(dbItem.uniqueUserSession),
                        purchases: Number(dbItem.purchaseCount),
                        value: String(dbItem.conversionRate)
                    }]
                }
            }, {})

            return context.response.body = {
                metric: id,
                dimensions: [dimensions],
                aggregation: aggregate,
                data: resultDb
            };
        }

        if (id === "net-revenue") {
            if (!(checkIfValidFilter(dimensions, id, "dimensions") && checkIfValidFilter(aggregate, id, "aggregate"))) {
                return context.response.body = "Invalid filter";
            }

            const startDate = restFilters['filter.date.from'];
            const endDate = restFilters['filter.date.to'];

            const client = await MySqlClient().get();

            let query = `
            select (prices.purchases - prices.refunds) as netRevenue, prices.user_id
                from (select sum(if(event_type = 'purchase', price, 0)) as purchases,
                sum(if(event_type = 'refund', price, 0))   as refunds,
                user_id
                from (select user_id, event_time, event_type, price
                    from dataSet
                    where event_time BETWEEN CAST('${startDate}' AS DATE) AND CAST('${endDate}' AS DATE)) dataG
                    group by user_id) as prices
            where prices.purchases <> 0
            `;

            let resultDb = await client.execute(query);

            if (!(resultDb && resultDb.length > 0)) {
                return context.response.status = 404;
            }

            resultDb = resultDb[0].reduce((acc, dbItem) => {
                return {
                    ...acc,
                    [dbItem.user_id]: [{
                        value: Number(dbItem.netRevenue)
                    }]
                }
            }, {})

            return context.response.body = {
                metric: id,
                dimensions: [dimensions],
                aggregation: aggregate,
                "filters": {
                    "date": {
                        "from": startDate,
                        "to": endDate
                    }
                },
                data: resultDb
            };
        }

    });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({port: 8000});
