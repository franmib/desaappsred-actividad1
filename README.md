# SOFTIA.ES - Portal Técnico de APIs (.NET)

Este proyecto corresponde a la **Actividad 1** de la asignatura **Desarrollo de Aplicaciones en Red** de la Universidad Internacional de La Rioja (UNIR). Consiste en un blog corporativo interactivo desarrollado desde cero utilizando únicamente tecnologías frontend nativas: **HTML5, CSS3 y JavaScript**.

---

## 📂 Estructura del Proyecto

El proyecto está organizado de manera limpia y profesional de acuerdo con las recomendaciones del docente:

```text
codigo/
├── login.html                  # Pantalla de acceso corporativo con validación local (usuario/clave)
├── index.html                  # Panel principal del blog (catálogo dinámico, buscador y comparativas)
├── entrada1.html               # Entrada 1: Diseñando APIs REST con ASP.NET Core 8
├── entrada2.html               # Entrada 2: Microservicios y APIs en entornos .NET
├── entrada3.html               # Entrada 3: Asegurando APIs con OAuth2 y JWT en .NET
├── entrada-dinamica.html       # Plantilla dinámica para visualizar posts creados por el usuario
├── README.md                   # Este manual descriptivo y de despliegue
└── assets/
    ├── css/
    │   └── styles.css          # Estilos CSS generales (diseño responsivo, variables y animaciones)
    ├── js/
    │   ├── main.js             # Lógica interactiva principal (seguridad, fetch, localStorage y DOM)
    │   └── posts.json          # Archivo de datos estáticos iniciales con los artículos base
    └── img/
        └── (Imágenes multimedia cargadas directamente desde URLs optimizadas en el JSON)
```

---

## 🔑 Credenciales de Prueba (Login)

Para simular un entorno corporativo seguro, el blog cuenta con una pantalla de inicio de sesión previa. Si el usuario intenta acceder directamente a las páginas del blog sin iniciar sesión, JavaScript lo redirigirá automáticamente a la pantalla de login.

Utilice las siguientes credenciales para acceder:
- **Usuario:** `admin@softia.es`
- **Contraseña:** `dotnet2026`

*Nota: La validación de credenciales se realiza de forma local en el archivo `main.js` y el estado de la sesión se guarda temporalmente en el `sessionStorage` del navegador.*

---

## 🚀 Características Avanzadas 

Se han implementado los siguientes añadidos:

1. **Carga Dinámica asíncrona (AJAX / Fetch)**: La página principal (`index.html`) lee los artículos iniciales de manera asíncrona desde el archivo local `posts.json` mediante la API `fetch()`.
2. **Motor de Publicación Dinámica**: Los usuarios autenticados pueden presionar el botón "Nueva Entrada" en el panel principal. Esto abre un formulario modal que guarda la nueva entrada en el `localStorage` del navegador. De este modo, los posts personalizados conviven con los iniciales en la misma interfaz y persisten al recargar.
3. **Buscador Reactivo y Filtro de Categorías**: Permite buscar artículos técnicos en tiempo real filtrando los textos de título y resumen, además de segmentarlos haciendo clic en botones de categoría ("Tutoriales", "Arquitectura", "Seguridad").
4. **Sistema de Comentarios Persistentes**: Al final de cada artículo (tanto estáticos como dinámicos), se dispone de un formulario interactivo para que los lectores dejen sus comentarios. Estos se añaden dinámicamente al DOM y se guardan en el `localStorage` bajo el identificador único de cada artículo.
5. **Diseño Gráfico**:
   - Estética tecnológica usando variables CSS adaptadas a la paleta de .NET (Violeta corporativo y tonos pizarra).
   - Efecto Glassmorphism en la pantalla de Login.
   - Diseño adaptable (responsive) a teléfonos móviles, tabletas y ordenadores portátiles mediante CSS Flexbox y CSS Grid.
   - Transiciones suaves y efectos de elevación al posicionar el cursor (`hover`) sobre las tarjetas de artículos.

---

## 🌍 Blog funcionando en un servidor estático

Para cumplir con la directiva de subir el blog a un servidor estático en Internet, tenemos dos urls disponibles:

1. **Utilizando Github Pages** -> https://franmib.github.io/desaappsred-actividad1/login.html  
   
2. **URL en un hosting comercial** -> https://blog.softia.es/login.html
