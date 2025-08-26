const OPENAI_KEY = process.env.OPENAI_API_KEY
if(!OPENAI_KEY){
  console.error('Set OPENAI_API_KEY in the environment before starting the server')
  process.exit(1)
}

app.use(express.static('.')) // serves index.html if you place it in same folder

$Env:OPENAI_API_KEY="sk-yourkeyhere"
node server.js
