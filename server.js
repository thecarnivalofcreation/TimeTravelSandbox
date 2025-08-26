const OPENAI_KEY = process.env.OPENAI_API_KEY
if(!OPENAI_KEY){
  console.error('Set OPENAI_API_KEY in the environment before starting the server')
  process.exit(1)
}

$Env:OPENAI_API_KEY="sk-yourkeyhere"
node server.js
