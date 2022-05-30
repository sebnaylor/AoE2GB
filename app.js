const express = require('express')

const app = express()

app.set('view engine', 'ejs')

app.listen(3000)

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