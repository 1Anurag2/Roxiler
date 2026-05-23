const db = require("../config/db");


// GET STORES


exports.getStores =
async(req,res)=>{

try{

const userId =
req.user.id;


const [stores] =
await db.execute(

`

SELECT

s.id,
s.name,
s.address,

AVG(
r.score
)
AS overallRating,

(

SELECT score

FROM rating

WHERE
userId=?

AND
storeId=s.id

LIMIT 1

)

AS userRating


FROM store s

LEFT JOIN rating r

ON
r.storeId=s.id


GROUP BY
s.id


`,

[userId]

);


const formatted =
stores.map(
store=>({

id:
store.id,

name:
store.name,

address:
store.address,

overallRating:
store.overallRating
? Number(
store.overallRating
)
:0,

userRating:
store.userRating
?? null

})
);


res.json(
formatted
);


}catch(err){

console.log(err);

res
.status(500)
.json({

error:
"Internal server error"

});

}

};




// SUBMIT RATING


exports.submitRating =
async(req,res)=>{

try{

const userId =
req.user.id;

const {

storeId,
score

}=req.body;


if(
score<1
||
score>5
){

return res
.status(400)
.json({

error:
"Score must be between 1 and 5"

});

}



const [existing]=
await db.execute(

`

SELECT id

FROM rating

WHERE

userId=?

AND

storeId=?

LIMIT 1

`,

[
userId,
storeId
]

);



if(
existing.length
){

await db.execute(

`

UPDATE rating

SET score=?

WHERE id=?

`,

[
score,
existing[0].id
]

);

}else{


const crypto =
require("crypto");


await db.execute(

`

INSERT INTO rating

(

id,
score,
userId,
storeId

)

VALUES

(?,?,?,?)

`,

[
crypto.randomUUID(),
score,
userId,
storeId
]

);

}


res.json({

message:
"Rating submitted successfully"

});


}catch(err){

console.log(err);

res
.status(500)
.json({

error:
"Internal server error"

});

}

};