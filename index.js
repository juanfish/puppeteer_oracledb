const oracledb = require('oracledb')
const config = {
  user: 'ultrasec',
  password: 'ultrasec',
  connectString: 'tivalsa'
}

const puppeteer = require('puppeteer');


async function main (){
    const browser = await puppeteer.launch();
    // const browser = await puppeteer.launch({headless:false}); // default is true
    const page = await browser.newPage();
    await page.goto('https://www.bcv.org.ve/');
    await page.screenshot({path: 'bcv.png'})
    
    title = await page.evaluate(() => {
        // retorno el precio de la tasa del dolar
        return document.querySelector(".views-row.views-row-1.views-row-odd.views-row-first"+
                                        ".views-row-last.row>#dolar>div>div>div:last-child").textContent.trim();
    });
    const tasa = Number(title.replace(',','.'));        
    browser.close();
    insertaTasa('2022001','USD',tasa);
}

async function getEmployee (empId) {
  let conn

  try {
    conn = await oracledb.getConnection(config)    

    const result = await conn.execute(
      'select * from finales where nu_final = :id',
      [empId]
      
    )

    console.log(result.rows[0])

  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

async function insertaTasa (fecha,moneda,tasa) {
  let conn
    
  try {
    conn = await oracledb.getConnection(config)    

    const sql = 'INSERT INTO TASASQUINIELA ( MT_TASA, FL_TASA, CO_TASA, NU_SECUENCIA )  VALUES ( :1 , :2, :3, NUTASAQUI.NEXTVAL )';
    const binds = [ [tasa, fecha, moneda] ];

    await conn.executeMany(sql, binds,{autoCommit:true});

    // const result = await conn.execute(    
    // `INSERT INTO TASASQUINIELA ( MT_TASA )  VALUES ( :1 )`,      
    // [[0,1]],
    //   {autoCommit :true}
    // )

    console.log('registro insertado')

  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

main()