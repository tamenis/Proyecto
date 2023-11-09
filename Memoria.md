# <center> Memoria del proyecto </center>
## <center> Desarrollo de una página web con Astro y MongoDB </center>
### <center> Introducción </center>

<p>&nbsp;&nbsp;&nbsp;&nbsp;La idea de este proyecto es crear una página web que funcionará como una presentación para la venta de un producto. Este producto son viviendas de construcción modular, por lo que el diseño de la página estará relacionado con este concepto, y no incluiré una opción para la compra en línea. Sin embargo, desarrollaré un formulario que enviará los datos a una base de datos para almacenar la información de contacto y los mensajes de posibles clientes. </br>

&nbsp;&nbsp;&nbsp;&nbsp;En las siguientes páginas, explicaremos paso a paso la creación de esta página web, que seguirá un esquema de diseño de "Modelo Vista Controlador". Comenzaremos por desplegar un entorno de desarrollo en Docker, lo que permitirá trabajar en una misma versión y reproducir el entorno de producción en nuestro propio ordenador. Luego, continuaremos con el diseño del Frontend utilizando Astro y Tailwind CSS. Seguiremos con el Backend, diseñando la estructura de la base de datos y permitiendo la conexión del cliente con el servidor para enviar información. Finalmente, llegaremos a estudiar el despliegue de la versión de producción en algunas de las plataformas habituales, como AWS, Google Cloud, Vercel, Netlify o Azure.</p>

### <center> Software necesario y descripción <center>
&nbsp;&nbsp;&nbsp;&nbsp;A continuación describiré las tecnologías necesarias para reproducir esta memoria.
 - **Node JS:** <p>Node JS es un entorno de ejecución de Javascript. Nos permite ejecutar Javascript fuera del navegador, utiliza el motor V8 de Google Chrome y funciona a través de procesos de un solo hilo  </p>
 - **Npm:** <p>Npm </p>
 - **Tailwind CSS:**
 - **Astro:**
 - **Express:**
 - **Nodemon:**
 - **Mongo DB:** 
 - **Docker:** Docker nos permite replicar un entorno de desarrollo a través de la creación de imagenes y la gestión de contenedores. Nos sirve para levantar maquinas virtuales y configurarlas principalmente a través de archivos **Dockerfile**. Para la configuración docker también nos permite acceder de manera sencilla a traves de el comando <code>docker exec [nombre del contenedor]</code>   
 - **Docker Compose:**

### <center> Desarrollo del trabajo </center>
#### <center> 1. Creación del entorno de desarrollo </center>

&nbsp;&nbsp;&nbsp;&nbsp;Para la realización de esta parte he utilizado la tecnología de virtualización de contenedores Docker. .Adicionalmente ha sido necesaria la implementación de docker compose para incluir en el entorno virtual un contenedor que ejecute una imagen de Mongo DB. Para empezar he creado un archivo **Dockerfile** que dictará las instrucciones que ha de seguir docker para construir la imagen y posteriormente el contenedor. A continuación voy a proceder a explicar el código utilizado.

``` Docker
//Descargamos la imagen de Node
FROM node:18 AS runtime
//Creamos una carpeta y la asignamos como espacio de trabajo
RUN mkdir -p /usr/app
WORKDIR /usr/app
//Copiamos todo el contenido de nuestra aplicación en el directorio que hemos establecido como espacio de trabajo
COPY . .
//Comandos de npm para instalar las dependencias y para construir un entorno de desarrollo
RUN npm install
RUN npm run build
//Variables asignadas para la configuración de red
ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
//Comando para iniciar el script que pondrá en funcionamiento el servidor
CMD nodemon ./dist/server/entry.mjs 
```
&nbsp;&nbsp;&nbsp;&nbsp;Para que npm descargue e instale los archivos necesarios necesitamos que 3 archivos hayan sido configurados previamente(**package.json, package-lock.json y astro.config.mjs**). La manera en la que he realizado esto ha sido a través de instalar con npm todas las dependencias en mi ordenador y posteriormente he configurando el archivo de **astro.config.mjs** para que permita el SSR (server side rendering). Pero en el caso de que quisiesemos reproducir este mismo entorno solo habriamos de copiar estos 3 archivos ya configurados en el contenedor antes de ejecutar el comando de ```npm install ``` </br>
&nbsp;&nbsp;&nbsp;&nbsp;Las dependencias que hemos utilizado pueden instalarse localmente a través del gestor de paquetes de Node npm. Las dependencias que hemos instalado han sido:

-Astro : <code>npm create astro@latest</code></br>
-Tailwind CSS : <code>npm run astro add tailwind</code></br>
-Node : <code>npm run astro add node</code></br>
-Express : <code>npm install express</code></br>
-Nodemon : <code>npm install nodemon -D</code></br>

Para habilitar el SSR ha sido necesario configurar el archivo **astro.config.mjs**. Este es el archivo con las lineas modificadas:</br>
```javascript
import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
+  output: "server",
+  adapter: node({
+    mode: "standalone"
  })
}); 
``` 
&nbsp;&nbsp;&nbsp;&nbsp;El softaware de **Docker Compose** permite levantar dos contenedores simultaneos y enlazados entre si (uno para nuestra página web y otro para la base de datos) el software de **docker-compose** nos será de mucha ayuda para construir un entorno virtual sin preocuparnos en la configuración de red y la gestión de versiones hasta la fase de producción.   
&nbsp;&nbsp;&nbsp;&nbsp; El archivo de Docker Compose ha de tener el nombre específico de **docker-compose.yml**. Este formato de archivo posee una sintaxis muy restrictiva pero que resulta intuitiva hay que respetar los espaciados y las tabulaciones, estos actuan a modo de elementos con herencia por lo que las imagenes de **web** o **mongo** han de ir tabuladas una vez con respecto a **services**. Con este archivo le damos a docker unas instrucciones claras sobre como ha de construir los dos contenedores pudiendo referenciar a archivos **Dockerfile** para construir los contenedores sobre nuestras propias imagenes o explicitando en el archivo que imagen queremos descargar de las ya existentes creadas por la comunidad. A continuación voy a explicar el archivo de **docker-compose.yml** haciendo especial hincapíe en algunas dificultades.

```yaml
//version de Docker Compose
 version: '3'
//En este apartado vienen descritos las imagenes y consecuentemente los contenedores que vamos a desplegar
services:
  //Imagen node-js
  web:
    //Nombre del contenedor
    container_name: web-app
    //Con este parametro se describe la frecuencia con la que el contenedor se reinicia
    restart: always
    //Con build le indicamos donde se encuentra el archivo Dockerfile para construir esta imagen
    build: .
    //Ports expone los puertos que le indiquemos en el contenedor y en el host del contenedor
    ports:
      - "4321:4321"
    //Links indica que el contenedor web depende de que el contenedor mongo funcione
    links:
      - mongo
    //Volumes crea dos carpetas, una en el contenedor y otra en la máquina local estas carpetas estan enlazadas y se actualizan cada vez que cambiamos el contenido, hablaremos más sobre volumes y el error que provocaba con el archivo entry.mjs
    volumes:
      - ./src:/usr/app/src
  //Este es el contenedor que despliega la imagen de Mongo DB.
  mongo:
    container_name: mongodb
    //Image indicará a Docker que queremos que descargue la imagen de sus repositorios tal cómo lo haciamos en el archivo Dockerfile 
    image: mongo
    ports:
      - "27018:27017"
    /En este caso volumes creará una carpeta en el ordenador local con todos los archivos de mongo db, lo que nos permitiría realizar una copia de seguridad de manera sencilla
    volumes:
      - ./db:/data/db
    
```
&nbsp;&nbsp;&nbsp;&nbsp; Una vez que tenemos este archivo es el momento de crear las imagenes y levantar los contenedores, para esto hemos de escribir dos comandos en la terminal mientras nos encontramos en la carpeta en la que creamos el archivo **docker-compose.yml**. El comando que utilizamos para construir las imagenes: **docker-compose build** y por último el comando que utilizamos para desplegar los contenedores: **docker-compose up**. Una vez que esten desplegados los contenedores simplemente tendremos que acceder a [localhost:4321](localhost:4321) en nuestro navegador web para ver la página de **index.astro**.

#### <center> 2. Diseño Frontend con Astro </center>