# Memoria del proyecto

### Desarrollo de una página web con Astro, NodeJS y MongoDB

## Introducción

La idea de este proyecto es crear una página web que funcionará como una presentación para la venta de un producto. Este producto son viviendas de construcción modular. Por lo tanto, el diseño de la página estará relacionado con este concepto y no incluiré una opción para la compra en línea. Sin embargo, desarrollaré un formulario que enviará los datos a una base de datos para almacenar la información de contacto y los mensajes de posibles clientes.

En las siguientes páginas, explicaremos paso a paso la creación de esta página web, que seguirá un esquema de diseño de "Modelo Vista Controlador". Comenzaremos por desplegar un entorno de desarrollo en Docker, lo que permitirá trabajar en una misma versión y reproducir el entorno de producción en nuestro propio ordenador. Luego, continuaremos con el diseño del Frontend utilizando Astro y Tailwind CSS. Seguiremos con el Backend, diseñando la estructura de la base de datos y permitiendo la conexión del cliente con el servidor para enviar información. Finalmente, llegaremos a estudiar el despliegue de la versión de producción en algunas de las plataformas habituales, como AWS, Netlify o Azure.

## Metodología del trabajo

## Software necesario y descripción

    A continuación describiré las tecnologías necesarias para reproducir esta memoria.

- **Node JS:** Node JS es un entorno de ejecución de Javascript que nos permite ejecutar Javascript fuera del navegador. Funciona a través de procesos de un solo hilo y será utilizado como backend para conectar la aplicación con una base de datos. La elección de Node JS se debe al uso del mismo lenguaje, Javascript, y a la gran cantidad de contenido disponible en internet sobre despliegue de aplicaciones web con Node.
- **Npm:** Npm es un gestor de paquetes para Node JS. Utilizaremos Npm para descargar todas las dependencias y generar el template de Astro. Npm utiliza los archivos "package.json" y "package-lock.json" para gestionar las dependencias. Aunque existe una alternativa llamada Bun, que proporciona mejor rendimiento y administración de paquetes, no se incluirá en este proyecto debido a su reciente lanzamiento. La elección de Node y npm se debe a su antigüedad y al soporte a largo plazo que ofrecen, lo que asegura la disponibilidad de información sobre despliegue de aplicaciones web.
- **Tailwind CSS:** Tailwind es una herramienta que interpreta las etiquetas de HTML y los componentes de Javascript de una página para generar estilos en CSS. Facilita el desarrollo al reducir las posibilidades de CSS a componentes estandarizados, evitando la necesidad de generar nombres de clases y escribir estilos correspondientes en CSS. Además, evita la necesidad de utilizar media queries para cambiar entre modos claro y oscuro o para hacer que la página sea responsive.
- **Astro:** Astro es un framework web que permite construir aplicaciones web utilizando componentes de Javascript y renderizar las páginas de manera estática. También ofrece la opción de renderizar las páginas en el servidor para realizar cambios dinámicos, enviar datos y procesar peticiones HTTP.
- **Express:** Express es un framework de aplicaciones web para Node JS que simplifica la creación de servidores y el manejo de rutas, peticiones y respuestas HTTP.
- **MongoDB:** MongoDB es una base de datos NoSQL que utilizaremos para almacenar la información de contacto y los mensajes de posibles clientes. Nos permitirá trabajar con datos estructurados y no estructurados de manera flexible.
- **Docker:** Docker nos permite crear y gestionar contenedores para replicar un entorno de desarrollo. Utilizaremos archivos Dockerfile para configurar las máquinas virtuales y Docker Compose para construir y levantar los contenedores de manera simultánea y enlazada, evitando una configuración de red compleja y la virtualización individual de cada contenedor.
- Netlify:

## Desarrollo del trabajo

### 1. Creación del entorno de desarrollo

### 1.1 Dependencias necesarias de npm

La administración de paquetes va a ser realizada con npm. Este gestor de paquetes para Node JS gestiona los paquetes necesarios a través de 2 archivos (**package.json, package-lock.json**). Npm instalará todos los módulos en la carpeta de **node_modules**. La manera en la que he procedido ha sido instalar con npm todas las dependencias en mi ordenador y posteriormente he configurando el archivo de **astro.config.mjs** para que permita el SSR (Server Side Rendering). Pero en el caso de que quisieramos reproducir este mismo entorno solo habríamos de copiar estos 3 archivos ya configurados en el contenedor antes de ejecutar el comando de `npm install`.

Las dependencias que he usado para este proyecto han sido:

- Astro: `npm create astro@latest`
- Tailwind CSS: `npm run astro add tailwind`
- Node: `npm run astro add node`
- Express: `npm install express`
- MongoDB: `npm install mongodb`

Astro por defecto intenta minimizar la cantidad de Javascript que enviamos al cliente, disminuyendo de manera significativa el tiempo de respuesta y tiempo de carga de páginas web, por ello este framework opta por renderizar las páginas web de manera estática. A pesar de ello, Astro permite optar por renderizar las páginas web en el servidor, lo que será necesario para establecer cambios dinámicos en la página, enviar datos a un servidor, procesar una petición Http... Para que nuestra aplicación sea capaz de renderizar javascript en el servidor es necesario habilitar la opción de Astro de Server Side Rendering, esta opción permite que la aplicación no sea únicamente renderizada como HTML y CSS. La opción que se ha elegido para este trabajo es una tercera opción, esta opción optará por defecto por construir las páginas de manera estática pero permite hacer un bypass para que algunos componentes o páginas sean renderizados en el lado del servidor. Para habilitar el SSR es necesario configurar el archivo **astro.config.mjs**. Este es el archivo con las líneas modificadas:

```jsx
import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";

export default defineConfig({
  integrations: [tailwind()],
  output: "hybrid",
  adapter: node({
    mode: "standalone"
  })
});

```

### 1.2 Contenedores de Docker

Para la realización de esta parte he utilizado la tecnología de virtualización de contenedores Docker. Adicionalmente ha sido necesaria la implementación de Docker Compose para incluir en el entorno virtual un contenedor que ejecute una imagen de MongoDB. Para empezar, he creado un archivo `Dockerfile` que dictará las instrucciones que ha de seguir Docker para construir la imagen y posteriormente el contenedor. A continuación, voy a proceder a explicar el código utilizado.

```
// Descargamos la imagen de Node
FROM node:18 AS runtime
// Creamos una carpeta y la asignamos como espacio de trabajo
RUN mkdir -p /usr/app
WORKDIR /usr/app
// Copiamos todo el contenido de nuestra aplicación en el directorio que hemos establecido como espacio de trabajo
COPY . .
// Comandos de npm para instalar las dependencias y para construir un entorno de desarrollo
RUN npm install
RUN npm run build
// Variables asignadas para la configuración de red
ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
// Comando para iniciar el script que pondrá en funcionamiento el servidor
CMD nodemon ./dist/server/entry.mjs

```

El software de **Docker Compose** permite levantar dos contenedores simultáneos y enlazados entre sí (uno para nuestra página web y otro para la base de datos). El software de **docker-compose** nos será de mucha ayuda para construir un entorno virtual sin preocuparnos en la configuración de red y la gestión de versiones hasta la fase de producción.

El archivo de Docker Compose ha de tener el nombre específico de `docker-compose.yml`. Este formato de archivo posee una sintaxis muy restrictiva pero que resulta intuitiva. Hay que respetar los espaciados y las tabulaciones, que actúan a modo de elementos con herencia, por lo que las imágenes de **web** o **mongo** han de ir tabuladas una vez con respecto a **services**. Con este archivo le damos a Docker unas instrucciones claras sobre cómo ha de construir los dos contenedores, pudiendo referenciar a archivos `Dockerfile` para construir los contenedores sobre nuestras propias imágenes o explicitando en el archivo qué imagen queremos descargar de las ya existentes creadas por la comunidad. A continuación voy a explicar el archivo de `docker-compose.yml`.

```yaml
// Version de Docker Compose
version: '3'
// En este apartado vienen descritas las imágenes y consecuentemente los contenedores que vamos a desplegar
services:
  // Imagen node-js
  web:
    // Nombre del contenedor
    container_name: web-app
    // Con este parámetro se describe la frecuencia con la que el contenedor se reinicia
    restart: always
    // Con build le indicamos dónde se encuentra el archivo Dockerfile para construir esta imagen
    build: .
    // Ports expone los puertos que le indiquemos en el contenedor y en el host del contenedor
    ports:
      - "4321:4321"
    // Links indica que el contenedor web depende de que el contenedor mongo funcione
    links:
      - mongo
    // Volumes crea dos carpetas, una en el contenedor y otra en la máquina local. Estas carpetas están enlazadas y se actualizan cada vez que cambiamos el contenido.
    volumes:
      - ./src:/usr/app/src

  // Este es el contenedor que despliega la imagen de MongoDB
  mongo:
    container_name: mongodb
    // Image indicará a Docker que queremos que descargue la imagen de sus repositorios
    image: mongo
    ports:
      - "27018:27017"
    // En este caso, Volumes creará una carpeta en el ordenador local con todos los archivos de MongoDB, lo que nos permitiría realizar una copia de seguridad de manera sencilla
    volumes:
      - ./db:/data/db

```

Una vez que tenemos este archivo, es el momento de crear las imágenes y levantar los contenedores. Para esto, hemos de escribir dos comandos en la terminal mientras nos encontramos en la carpeta en la que creamos el archivo `docker-compose.yml`. El comando que utilizamos para construir las imágenes es `docker-compose build`, y por último, el comando que utilizamos para desplegar los contenedores es `docker-compose up`. Una vez que estén desplegados los contenedores, simplemente tendremos que acceder a [localhost:4321](http://localhost:4321/) en nuestro navegador web para ver la página de `index.astro`.

###