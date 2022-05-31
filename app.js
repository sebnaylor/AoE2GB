const express = require('express')
const app = express()
const port = 3000

app.set('view engine', 'ejs')

app.listen(port)

app.use(express.static('public'))


app.get('/', (req, res) => {
    res.sendFile('./views/home.html', { root: __dirname})
})

app.get('/profile', (req, res) => {
    res.render('profile', { title: 'Profile' })
})

app.use((req, res) => {
    res.status(404).sendFile('./views/404.html', { root: __dirname})
})