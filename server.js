const express = require('express');
const app = express();

//validator
const Validator = require('validatorjs');

const { Client } = require('pg');
const knex = require('knex'); // knex kütüphanesini içe aktarın

const client = new Client({
  user: 'db_user',
  host: 'localhost',
  database: 'nodeDb',
  password: 'db_password',
  port: 5432, // PostgreSQL varsayılan bağlantı noktası
});

client.connect();

// PostgreSQL sorgularını burada çalıştırabilirsiniz.



// knex bağlantısını oluşturun (ayrıca, veritabanı türünü ve bağlantı ayrıntılarınızı belirtmelisiniz)
const knexConfig = {
  client: 'pg',
  connection: {
    user: 'db_user',
    host: 'localhost',
    database: 'nodeDb',
    password: 'db_password',
    port: 5432,
  },
};

const knexInstance = knex(knexConfig);

// Veritabanı tablolarının ilk ayakta kalkarken oluşturulması için migration işlemi
async function InitDatabaseMigration() {
  console.log('Migration start');
  await knexInstance.schema.createTableIfNotExists('tweets', (table) => {
    table.increments('id').primary();
    table.string('tweet');
    table.string('username');
    
    // created_at
    table.timestamp('created_at').defaultTo(knexInstance.fn.now());
  });
  console.log('Migration finish');
}

InitDatabaseMigration();




//json parser
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//get / -Hello world
app.get('/', (req, res) => {
    res.send("hello");  //return Hello World
    });
//get /tweets -Return all tweets
    app.get('/tweets',async (req,res)=>{ 
       
        try{
            let tweets = await knex('tweets').select();
          }catch(error){
              console.log(error)
              return res.status(500).send(error);
          }
              return res.json({
                  tweets:tweets
              
              });
        })
//get /tweets/:id -Return a spasific tweet
app.get('/tweets/:id',async (req,res)=>{
    const id = req.params.id;


    try{
        let tweet = await knex('tweets').where('id',id).first();
      }catch(error){
          console.log(error)
          return res.status(500).send(error);
      }
      
          return res.json({
            tweet:tweet
          
          });
    
})


//post /tweets -Create a new tweet
app.post("/tweets",async (req, res) => {
const createDto = new Validator(req.body,{
    tweet:'required|string|min:1|max:255',
    username:'required|string|min:1|max:20',
});
if(createDto.fails()){
    return res.status(400).json({
        message:createDto.errors.all()
    });
}

//save to db
try{
    let tweet = await knex('tweets').insert({
        tweet:req.body.tweet,
        username : req.body.username
    })
}catch(error){
    console.log(error)
   return res.status(500).send(error);

}
return res.json({
    message:'Tweet created',
    tweet:tweet

});

})

//put /tweets/:id -Update a tweet
app.put('/tweets/:id',async(req,res)=>{
    const id = req.params.id;
    const updateDto=new Validator(req.body,{
        tweet:'required|string|min:1|max:255',
        username:'required|string|min:1|max:20',
    });
    if(updateDto.fails()){
        return res.status(400).json({
           message: updateDto.errors.all(),
        });
//update to db
try{
  let tweet = await knex('tweets').where('id',id).update({
    tweet:req.body.tweet,
    username:req.body.user,

  })
}catch(error){
    console.log(error)
    return res.status(500).send(error);
}

    }
    return res.json({
        message:'Tweet updated',
        updated_tweet:tweet
    
    });
});



//delete /tweets/:id -Delete a tweet
app.delete('/tweets/:id',async(req,res)=>{
    const {id}=req.params;
    try{
      let tweet = await knex('tweets').where('id',id).delete();
    }catch(error){
        console.log(error)
    return res.status(500).send(error);
    }
    return res.json({
        message:'Tweet deleted',
        deleted_tweet:tweet
    
    });
})

client.end();

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
})