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
    
    
    title = await page.evaluate(() => {
        // retorno el precio de la tasa del dolar
        return document.querySelector(".views-row.views-row-1.views-row-odd.views-row-first"+
                                        ".views-row-last.row>#dolar>div>div>div:last-child").textContent.trim();
    });
    const tasa = Number(title.replace(',','.'));        
    browser.close();
    const hoy = new Date(Date.now());

    const fechaParseada = hoy.getFullYear().toString() + '-'+
                       (hoy.getMonth()+1).toString().padStart(2,'0')+ '-'+
                       hoy.getDate().toString().padStart(2,'0')
    insertaTasa(flch_a_jul(fechaParseada),'USD',tasa);
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

function flch_a_jul(fecha) {
  
  const year = fecha.substr(0,4)
  const fechaInicio = new Date(year+'-01-01').getTime();
  var fechaFin = new Date(fecha).getTime();

  const diff = fechaFin - fechaInicio;
  var dias = (diff/(1000*60*60*24) + 1).toString();
  
  return  year+dias.padStart(3,'0');
}

main();