db.createCollection("forms",
{
    capped:true,
    size:100000000,
    max:100,
    validator:{
        $jsonSchema:{
            bsonType:"object",
            title:"formValidator",
            required:["nombre","fecha","correo"],
            properties: {
                nombre:{
                    bsonType:"string",
                    description:"Introduce tu nombre"
                },
                correo:{
                    bsonType:"string",
                    description:"introduce tu correo"
                },
                telefono:{
                    bsonType:"string",
                    description:"introduce tu numero de telefono"
                },
                mensaje:{
                    bsonType:"string"
                    },
                fecha:{
                    bsonType:"date"
                },

            }
        }
    }

}
)