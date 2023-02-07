let priceList = require('./prices.json');
let cfg = require('./config.json')
const express = require('express');
const router = express.Router();

const pool = require('./pool.js')
const checkAuth = require('./check_auth');
const checkAdmin = require('./check_admin');

var format = require('pg-format');


router.get("/", (req, res) => {
    let query = {
        text: 'SELECT * from show',
    };

    // issue query (returns promise)
    pool.query(query).then((response) => {
        resultRows = response.rows;

        // no results
        if (resultRows.length < 1) {
            res.status(401).json({
                "message": "no results in show table"
            });
            return;
        }

        // everything ok -- return results
        //let response = { imageIds: resultRows.map(item => item.id) }; // only return the ids
        res.status(200).json(resultRows);
    }).catch(error => {
        // error accessing db
        if (error) {
            res.status(400).json({
                "message": "show get error occurred"
            });
            console.log(error.stack);
            pool.end;
        }
    });
    pool.end;
});

router.get("/getshowid/:id", (req, res) => {

    let id = req.params.id;
    let query = {
        text: 'SELECT * from show WHERE show_id = $1',
        values: [id]
    };

    // issue query (returns promise)
    pool.query(query).then((response) => {
        resultRows = response.rows;

        // no results
        if (resultRows.length < 1) {
            res.status(401).json({
                "message": "no results in theater table"
            });
            return;
        }

        // everything ok -- return results
        //let response = { imageIds: resultRows.map(item => item.id) }; // only return the ids
        res.status(200).json(resultRows);
    }).catch(error => {
        // error accessing db
        if (error) {
            res.status(400).json({
                "message": "Theather add error occurred"
            });
            console.log(error.stack);
            pool.end;
        }
    });
    pool.end;
});

function checkTheather(theater_id, movie) {

    return new Promise((resolve, reject) => {
        let query = {
            text: 'SELECT * from theater WHERE theater_id = $1',
            values: [theater_id]
        };
        pool.query(query).then((response) => {
            resultRows = response.rows;
            // no results
            if (resultRows.length < 1) {
                pool.end;
                reject(false);
            }
            if (!((response.rows[0].screentype === "2D,3D" && movie.screentype === "3D") || movie.screentype === "2D")) {
                pool.end;
                reject(false);
            }
            if (!((response.rows[0].soundtype === "Dolby Surround, ATMOS" && movie.soundtype === "Dolby Atmos") || movie.soundtype === "Dolby Surround")) {
                pool.end;
                reject(false);
            }
            resolve(true);
        }).catch(error => {
            // error accessing db
            if (error) {
                console.log(error.stack);
                pool.end;
                reject(false);
            }
        });
    });

}

function checkMovie(movie) {

    return new Promise((resolve, reject) => {

        let query = {
            text: 'SELECT * from movies WHERE movie_id = $1',
            values: [movie]
        };
        pool.query(query).then((response) => {
            resultRows = response.rows;
            // no results
            if (resultRows.length < 1) {
                pool.end;
                reject(false);
            }
            resolve(response.rows[0]);
        }).catch(error => {
            // error accessing db
            if (error) {
                console.log(error.stack);
                pool.end;
                reject(false);
            }
        });
    });
}

router.post("/add", checkAdmin, (req, res) => {
    console.log(req.body);
    checkMovie(req.body.movie_id).then(movie => {
        checkTheather(req.body.theater_id, movie).then(() => {
            let timeStart = new Date();
            timeStart.setTime(req.body.time);

            let timeEnd = new Date();
            timeEnd.setTime(timeStart);

            let movie_duration = 0;

            let query = {
                text: 'SELECT * FROM movies WHERE movie_id = $1',
                values: [req.body.movie_id]
            };
            pool.query(query).then((response) => {
                movie_duration = response.rows[0].movie_duration;
                console.log(movie_duration);
                timeEnd.setMinutes(timeEnd.getMinutes() + movie_duration + 10);
                query = {
                    text: 'SELECT * FROM show WHERE theater_id = $1 AND display_timestamp >= $2 AND display_timestamp < $3',
                    values: [req.body.theater_id, timeStart.getTime(), timeEnd.getTime()]
                };
                console.log(timeStart.getTime());
                console.log(timeEnd.getTime());
                pool.query(query).then((response) => {
                    resultRows = response.rows;
                    console.log(query);
                    console.log(response.rows);
                    // no results
                    if (resultRows.length > 0) {
                        res.status(401).json({
                            "message": "time overlap"
                        });
                        pool.end;
                        return;
                    } else {
                        query = {
                            text: 'INSERT INTO show(movie_id,theater_id,display_timestamp,display_time,date_of_display)  VALUES($1,$2,$3,$4,$5)',
                            values: [
                                req.body.movie_id,
                                req.body.theater_id,
                                timeStart.getTime(),
                                timeStart.getHours() + ":" + timeStart.getMinutes() + ":" + timeStart.getSeconds(),
                                timeStart.getFullYear() + "-" + timeStart.getMonth() + "-" + timeStart.getDay()
                            ]
                        };
                        pool.query(query).then((response) => {
                            res.status(200).json({
                                "message": "Show added"
                            });
                        }).catch(error => {
                            // error accessing db
                            if (error) {
                                res.status(400).json({
                                    "message": "error occurred"
                                });
                                console.log(error.stack);
                                pool.end;
                                return;
                            }
                        });
                        pool.end;
                    }
                }).catch(error => {
                    // error accessing db
                    if (error) {
                        res.status(400).json({
                            "message": "show add error occurred"
                        });
                        console.log(error.stack);
                        pool.end;
                        return;
                    }
                });
            }).catch(error => {
                // error accessing db
                if (error) {
                    res.status(400).json({
                        "message": "error occurred"
                    });
                    console.log(error.stack);
                    pool.end;
                    return;
                }
            });
        }).catch(() => {
            res.status(400).json({ "message": "theather does not exist, or not compatible" });
        });
    }).catch(() => {
        res.status(400).json({ "message": "movie does not exist" });
    });
});

module.exports = router;