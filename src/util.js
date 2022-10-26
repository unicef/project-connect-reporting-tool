const pgtools = require("pgtools");
const { Pool } = require("pg");
const moment = require("moment");
require("dotenv").config();
const connectionString =
  "postgresql://oiarazor_rousr@pgsql-10-shared-uniwebs-tst:O!aRA50RT5tRdO!0CK@pgsql-10-shared-uniwebs-tst.postgres.database.azure.com:5432/prd_oia_prjrazordb_ro?sslmode=require";

const pool = new Pool({
  connectionString,
});

const getProjectConnectData = async (date) => {
  console.log(date);

  let weeknumber = moment(date, "YYYY/MM/DD").week();
  console.log(weeknumber)

  // let query = `	select c.id, c.name, a.*  from public.connection_statistics_countryweeklystatus  a
  // inner join (
  //    select country_id, max(week) max_value
  //    from public.connection_statistics_countryweeklystatus where schools_total>0 and year<=2022 and date<='${date}'
  //    group by country_id 
  // )  t on t.country_id = a.country_id and t.max_value = a.week
  // inner join public.locations_country c on c.id=a.country_id
  // where a.schools_total>0 and a.year<=2022 and a.date <='${date}'
  // order by c.name`;


  //THE ABOVE IS THE OLD QUERY
  
  let query = `	select c.id, c.name,  a.*   from public.connection_statistics_countryweeklystatus  a
  inner join (
     select   country_id, year, max(week) max_value, row_number() over (partition by country_id order by year desc) as row_numbers
     from public.connection_statistics_countryweeklystatus where schools_total>0 and year<=2022 and date<='${date}' 
     group by country_id, year  order by country_id
  )  t on t.country_id = a.country_id and t.max_value = a.week
  inner join public.locations_country c on c.id=a.country_id
  where a.schools_total>0 and a.year<=2022 and a.date <='${date}' and t.row_numbers=1
  order by c.name`;

  let result = null;
  try {
    result = await pool.query(query);
  } catch (e) {
    console.log(e);
  }

  return result.rows;
};


const getDailyData = async (date) => {


  let query = `	SELECT count(distinct d.school_id), s.country_id
	FROM public.connection_statistics_schooldailystatus d 
	inner join public.schools_school s ON d.school_id = s.id 	
  WHERE d.date <= '${date}'
	group by s.country_id;`;

  let result = null;
  try {
    result = await pool.query(query);
  } catch (e) {
    console.log(e);
  }

  return result.rows;
};




module.exports = {
  getProjectConnectData,getDailyData
};
