/* 
   ==========================================================================
   JAVASCRIPT GLOBAL - SOFTIA.ES DEVELOPER PORTAL
   Este archivo gestiona toda la lógica dinámica de la aplicación: autenticación,
   protección de rutas, carga dinámica de posts con fetch y localStorage, buscador,
   modal de publicación y la sección interactiva de comentarios.
   ========================================================================== 
*/

document.addEventListener("DOMContentLoaded", () => {
    // Inicializar funciones generales
    inicializarMenuMovil();
    inicializarBotonVolverArriba();
    
    // Detectar en qué página nos encontramos
    const path = window.location.pathname;
    const paginaActual = path.substring(path.lastIndexOf('/') + 1);

    // 1. CONTROL DE ACCESO (PROTECCIÓN DE RUTAS)
    // Evitamos el acceso a usuarios no logueados (excepto en login.html)
    if (paginaActual !== "login.html" && paginaActual !== "") {
        const sesionActiva = sessionStorage.getItem("loggedIn");
        if (!sesionActiva) {
            // Si no hay sesión iniciada, redirigir al Login
            window.location.href = "login.html";
            return;
        }
    }

    // 2. LOGICA ESPECIFICA DE LA PÁGINA DE LOGIN
    if (paginaActual === "login.html") {
        inicializarLogin();
    }

    // 3. LOGICA ESPECIFICA DEL INDEX (PORTAL / DASHBOARD)
    if (paginaActual === "index.html" || paginaActual === "") {
        inicializarPortal();
    }

    // 4. LOGICA ESPECIFICA DE LA VISTA DE ENTRADA DINÁMICA
    if (paginaActual === "entrada-dinamica.html") {
        inicializarVistaDinamica();
    }

    // 5. LOGICA DE COMENTARIOS (APLICABLE A LAS ENTRADAS ESTÁTICAS Y DINÁMICAS)
    if (paginaActual.startsWith("entrada")) {
        // Extraemos el ID del post desde el atributo del contenedor o de la URL
        let postId = document.body.dataset.postid;
        if (!postId && paginaActual === "entrada-dinamica.html") {
            const urlParams = new URLSearchParams(window.location.search);
            postId = urlParams.get("id");
        }
        
        if (postId) {
            inicializarComentarios(postId);
        }
    }

    // 6. EVENTO DE LOGOUT (CIERRE DE SESIÓN)
    const btnLogout = document.getElementById("logoutBtn");
    if (btnLogout) {
        btnLogout.addEventListener("click", (e) => {
            e.preventDefault();
            // Limpiamos la variable de sesión
            sessionStorage.removeItem("loggedIn");
            // Redirigimos al Login
            window.location.href = "login.html";
        });
    }
});

/* ==========================================================================
   FUNCIÓN: MENÚ RESPONSIVO (HAMBURGUESA)
   Abre y cierra el menú de navegación en dispositivos móviles.
   ========================================================================== */
function inicializarMenuMovil() {
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            menuToggle.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
    }
}

/* ==========================================================================
   FUNCIÓN: BOTÓN VOLVER ARRIBA
   Muestra un botón flotante al hacer scroll que regresa suavemente al inicio.
   ========================================================================== */
function inicializarBotonVolverArriba() {
    const btnTop = document.getElementById("btnBackToTop");
    if (!btnTop) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            btnTop.style.display = "flex";
        } else {
            btnTop.style.display = "none";
        }
    });

    btnTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

/* ==========================================================================
   FUNCIÓN: LÓGICA DE INICIO DE SESIÓN
   Valida credenciales en local y redirige al dashboard.
   ========================================================================== */
function inicializarLogin() {
    const loginForm = document.getElementById("loginForm");
    const loginAlert = document.getElementById("loginAlert");

    // Si ya está logueado, redirigir al index directamente
    if (sessionStorage.getItem("loggedIn")) {
        window.location.href = "index.html";
        return;
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const email = document.getElementById("emailInput").value.trim();
            const password = document.getElementById("passwordInput").value.trim();

            // Credenciales simuladas 
            const USER_OK = "admin@softia.es";
            const PASS_OK = "dotnet2026";

            if (email === USER_OK && password === PASS_OK) {
                // Guardar estado de sesión en sessionStorage (se borra al cerrar pestaña)
                sessionStorage.setItem("loggedIn", "true");
                
                // Mostrar alerta de éxito momentánea
                loginAlert.style.backgroundColor = "rgba(16, 185, 129, 0.15)";
                loginAlert.style.color = "#10b981";
                loginAlert.style.borderColor = "rgba(16, 185, 129, 0.3)";
                loginAlert.textContent = "¡Acceso autorizado! Redirigiendo...";
                loginAlert.style.display = "block";

                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);
            } else {
                // Credenciales incorrectas
                loginAlert.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
                loginAlert.style.color = "#f87171";
                loginAlert.style.borderColor = "rgba(239, 68, 68, 0.3)";
                loginAlert.textContent = "Credenciales incorrectas. Pruebe admin@softia.es / dotnet2026";
                loginAlert.style.display = "block";
            }
        });
    }
}

/* ==========================================================================
   FUNCIÓN: LÓGICA DEL PORTAL PRINCIPAL (CARGA DE POSTS Y BUSCADOR)
   Lee de posts.json y de localStorage para poblar y filtrar la cuadrícula.
   ========================================================================== */

// Base de datos de respaldo en JavaScript (Fallback)
// Evita fallos de carga en entornos locales sin servidor web (cuando se abre con file://)
const defaultPosts = [
  {
    "id": "1",
    "title": "Diseñando APIs REST con ASP.NET Core 8",
    "category": "Tutorial",
    "author": "Ing. Carlos Mendoza",
    "date": "2026-06-15",
    "readTime": "8 min",
    "summary": "Explora las novedades de ASP.NET Core 8, la inyección de dependencias nativa y cómo estructurar Minimal APIs de alto rendimiento con arquitectura limpia.",
    "image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    "url": "entrada1.html"
  },
  {
    "id": "2",
    "title": "Microservicios y APIs en entornos .NET",
    "category": "Arquitectura",
    "author": "Dra. Sofía Rivas",
    "date": "2026-06-10",
    "readTime": "12 min",
    "summary": "Guía completa para la orquestación de servicios en .NET usando API Gateways como YARP y Ocelot, y cómo gestionar la comunicación asíncrona mediante colas de mensajería.",
    "image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    "url": "entrada2.html"
  },
  {
    "id": "3",
    "title": "Asegurando APIs con OAuth2 y JWT en .NET",
    "category": "Seguridad",
    "author": "Mtr. Alejandro Torres",
    "date": "2026-06-05",
    "readTime": "10 min",
    "summary": "Aprende a proteger tus endpoints en ASP.NET Core aplicando autenticación basada en tokens JWT, políticas de autorización robustas y flujos seguros de OAuth2.",
    "image": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
    "url": "entrada3.html"
  }
];

let globalPosts = []; // Guardará todos los artículos cargados para poder filtrar en memoria

function inicializarPortal() {
    const blogGrid = document.getElementById("blogGrid");
    const searchInput = document.getElementById("searchInput");
    const filterButtons = document.querySelectorAll(".btn-filter");
    
    // Elementos del Modal de Creación
    const modalOverlay = document.getElementById("modalOverlay");
    const openModalBtn = document.getElementById("openModalBtn");
    const closeModalBtn = document.getElementById("closeModal");
    const cancelModalBtn = document.getElementById("cancelModalBtn");
    const newPostForm = document.getElementById("newPostForm");

    // Lógica para abrir/cerrar modal
    if (openModalBtn && modalOverlay) {
        openModalBtn.addEventListener("click", () => {
            modalOverlay.style.display = "flex";
            document.body.style.overflow = "hidden"; // Evita scroll detrás del modal
        });
    }

    const cerrarModal = () => {
        if (modalOverlay) {
            modalOverlay.style.display = "none";
            document.body.style.overflow = "auto";
            if (newPostForm) newPostForm.reset();
        }
    };

    if (closeModalBtn) closeModalBtn.addEventListener("click", cerrarModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener("click", cerrarModal);
    if (modalOverlay) {
        // Cerrar si se hace clic fuera del modal
        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) cerrarModal();
        });
    }

    // Envío del Formulario de Creación
    if (newPostForm) {
        newPostForm.addEventListener("submit", (e) => {
            e.preventDefault();

            // Extraemos los campos
            const titulo = document.getElementById("postTitleInput").value.trim();
            const categoria = document.getElementById("postCategorySelect").value;
            const autor = document.getElementById("postAuthorInput").value.trim();
            const resumen = document.getElementById("postSummaryInput").value.trim();
            const contenido = document.getElementById("postContentInput").value.trim();
            const imagen = document.getElementById("postImageInput").value.trim() || 
                "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80";

            // Creamos el objeto del nuevo artículo
            const nuevoPost = {
                id: "custom_" + Date.now(), // ID único basado en timestamp
                title: titulo,
                category: categoria,
                author: autor,
                date: new Date().toISOString().split('T')[0], // Fecha en formato YYYY-MM-DD
                readTime: Math.max(3, Math.ceil(contenido.split(" ").length / 200)) + " min", // Estima 200 palabras por minuto
                summary: resumen,
                content: contenido, // Se guarda para renderizar en la vista dinámica
                image: imagen,
                url: "entrada-dinamica.html"
            };

            // Guardamos en localStorage
            const postsGuardados = JSON.parse(localStorage.getItem("custom_posts")) || [];
            postsGuardados.unshift(nuevoPost); // Insertar al inicio
            localStorage.setItem("custom_posts", JSON.stringify(postsGuardados));

            // Cerrar modal
            cerrarModal();

            // Volver a cargar el listado para reflejar los cambios
            cargarArtículos();
        });
    }

    // Petición fetch para el archivo JSON inicial y combinación con localStorage
    function cargarArtículos() {
        fetch("assets/js/posts.json")
            .then(res => {
                if (!res.ok) throw new Error("Error al cargar posts.json");
                return res.json();
            })
            .then(dataEstática => {
                // Recuperar posts creados por el usuario en localStorage
                const dataDinámica = JSON.parse(localStorage.getItem("custom_posts")) || [];
                
                // Combinar ambos arrays (los del usuario van primero para destacar)
                globalPosts = [...dataDinámica, ...dataEstática];
                
                // Renderizar inicialmente todos los artículos
                renderizarArticulos(globalPosts);
            })
            .catch(err => {
                console.warn("La carga de posts.json falló (CORS local del protocolo file://). Usando base de datos de respaldo.");
                // Recuperar posts creados por el usuario en localStorage
                const dataDinámica = JSON.parse(localStorage.getItem("custom_posts")) || [];
                
                // Combinar posts dinámicos y base de datos local JS (fallback)
                globalPosts = [...dataDinámica, ...defaultPosts];
                
                // Renderizar inicialmente todos los artículos
                renderizarArticulos(globalPosts);
            });
    }

    // Pintar tarjetas de artículos en el grid
    function renderizarArticulos(articulos) {
        if (!blogGrid) return;
        blogGrid.innerHTML = "";

        if (articulos.length === 0) {
            blogGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <h3>No se encontraron artículos técnicos</h3>
                    <p>Intente con otra búsqueda o cree uno nuevo.</p>
                </div>`;
            return;
        }

        articulos.forEach(post => {
            const card = document.createElement("article");
            card.className = "blog-card";
            
            // Ruta destino: si es custom, apuntamos a la plantilla con el query string del ID
            const targetUrl = post.id.startsWith("custom_") 
                ? `${post.url}?id=${post.id}` 
                : post.url;

            card.innerHTML = `
                <div class="card-img-wrapper">
                    <span class="card-badge">${post.category}</span>
                    <img src="${post.image}" alt="${post.title}" class="card-img" loading="lazy">
                </div>
                <div class="card-body">
                    <h3 class="card-title">${post.title}</h3>
                    <p class="card-summary">${post.summary}</p>
                    <div class="card-footer">
                        <div>
                            <span>Por </span><span class="card-author">${post.author}</span>
                        </div>
                        <div>
                            <span>${post.readTime}</span>
                        </div>
                    </div>
                </div>
            `;

            // Hacer que toda la tarjeta sea clickable (mejora UX y cumple link)
            card.style.cursor = "pointer";
            card.addEventListener("click", () => {
                window.location.href = targetUrl;
            });

            blogGrid.appendChild(card);
        });
    }

    // Filtrado interactivo mediante buscador de texto
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            filtrarYRenderizar();
        });
    }

    // Filtrado interactivo mediante botones de categoría
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Quitar clase activa a todos y ponerla en el actual
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            filtrarYRenderizar();
        });
    });

    function filtrarYRenderizar() {
        const textoBusqueda = searchInput ? searchInput.value.toLowerCase().trim() : "";
        
        // Obtener la categoría seleccionada
        const btnActivo = document.querySelector(".btn-filter.active");
        const categoriaSeleccionada = btnActivo ? btnActivo.dataset.category : "Todos";

        const articulosFiltrados = globalPosts.filter(post => {
            const coincideTexto = post.title.toLowerCase().includes(textoBusqueda) || 
                                 post.summary.toLowerCase().includes(textoBusqueda);
            
            const coincideCategoria = (categoriaSeleccionada === "Todos") || 
                                      (post.category.toLowerCase() === categoriaSeleccionada.toLowerCase());
            
            return coincideTexto && coincideCategoria;
        });

        renderizarArticulos(articulosFiltrados);
    }

    // Cargar inicialmente al entrar a la web
    cargarArtículos();
}

/* ==========================================================================
   FUNCIÓN: LÓGICA DE DETALLE DINÁMICO (entrada-dinamica.html)
   Carga del localStorage el artículo dinámico y pinta su HTML completo.
   ========================================================================== */
function inicializarVistaDinamica() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");

    const tituloEl = document.getElementById("postTitle");
    const autorEl = document.getElementById("postAuthor");
    const fechaEl = document.getElementById("postDate");
    const categoriaEl = document.getElementById("postCategory");
    const tiempoEl = document.getElementById("postReadTime");
    const imagenEl = document.getElementById("postImage");
    const cuerpoEl = document.getElementById("postBody");
    const errorContenedor = document.getElementById("errorContainer");
    const articuloContenedor = document.getElementById("articleContainer");

    if (!postId) {
        mostrarErrorDinamico();
        return;
    }

    // Recuperar el artículo de localStorage
    const postsGuardados = JSON.parse(localStorage.getItem("custom_posts")) || [];
    const articulo = postsGuardados.find(p => p.id === postId);

    if (articulo) {
        // Pintar metadatos y contenido
        if (tituloEl) tituloEl.textContent = articulo.title;
        if (autorEl) autorEl.textContent = articulo.author;
        if (fechaEl) fechaEl.textContent = formatearFecha(articulo.date);
        if (categoriaEl) {
            categoriaEl.textContent = articulo.category;
            categoriaEl.className = "article-category";
        }
        if (tiempoEl) tiempoEl.textContent = articulo.readTime;
        if (imagenEl) {
            imagenEl.src = articulo.image;
            imagenEl.alt = articulo.title;
        }
        
        if (cuerpoEl) {
            // Convertimos saltos de línea en párrafos HTML
            const parrafos = articulo.content.split("\n\n").map(p => {
                if (p.trim().startsWith("```")) {
                    // Si es un bloque de código
                    return `<pre class="code-block">${p.replace(/```/g, "").trim()}</pre>`;
                }
                return `<p>${p.replace(/\n/g, "<br>")}</p>`;
            }).join("");
            
            cuerpoEl.innerHTML = parrafos;
        }

        if (articuloContenedor) articuloContenedor.style.display = "block";
        if (errorContenedor) errorContenedor.style.display = "none";
    } else {
        mostrarErrorDinamico();
    }

    function mostrarErrorDinamico() {
        if (articuloContenedor) articuloContenedor.style.display = "none";
        if (errorContenedor) {
            errorContenedor.style.display = "block";
            errorContenedor.innerHTML = `
                <div style="text-align: center; padding: 4rem 1rem;">
                    <h2>Artículo no encontrado</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 2rem;">El artículo solicitado no existe o fue eliminado.</p>
                    <a href="index.html" class="btn-primary" style="padding: 0.75rem 1.5rem;">Volver al Portal</a>
                </div>`;
        }
    }

    function formatearFecha(fechaStr) {
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fechaStr).toLocaleDateString('es-ES', opciones);
    }
}

/* ==========================================================================
   FUNCIÓN: GESTIÓN INTERACTIVA DE COMENTARIOS
   Carga, guarda y añade comentarios de usuarios mediante localStorage.
   ========================================================================== */
function inicializarComentarios(postId) {
    const commentForm = document.getElementById("commentForm");
    const commentsList = document.getElementById("commentsList");

    if (!commentForm || !commentsList) return;

    // Cargar comentarios existentes del localStorage para este Post
    const cargarComentarios = () => {
        commentsList.innerHTML = "";
        const comentarios = JSON.parse(localStorage.getItem("comments_" + postId)) || [];

        if (comentarios.length === 0) {
            commentsList.innerHTML = `<p style="color: var(--text-secondary); text-align: center; padding: 1rem 0;" id="noCommentsMsg">No hay comentarios en este artículo. ¡Sé el primero en escribir!</p>`;
            return;
        }

        comentarios.forEach(com => {
            const card = document.createElement("div");
            card.className = "comment-card";
            card.innerHTML = `
                <div class="comment-meta">
                    <span class="comment-author">${escapeHTML(com.nombre)}</span>
                    <span>${com.fecha}</span>
                </div>
                <div class="comment-text">
                    ${escapeHTML(com.texto).replace(/\n/g, "<br>")}
                </div>
            `;
            commentsList.appendChild(card);
        });
    };

    // Evento de envío de comentario
    commentForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const nombreInput = document.getElementById("commentNameInput");
        const textoInput = document.getElementById("commentTextInput");

        const nombre = nombreInput.value.trim();
        const texto = textoInput.value.trim();

        if (!nombre || !texto) {
            alert("Por favor, rellene todos los campos del comentario.");
            return;
        }

        // Crear objeto comentario
        const nuevoComentario = {
            nombre: nombre,
            texto: texto,
            fecha: new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        // Guardar en localStorage
        const comentarios = JSON.parse(localStorage.getItem("comments_" + postId)) || [];
        comentarios.push(nuevoComentario);
        localStorage.setItem("comments_" + postId, JSON.stringify(comentarios));

        // Limpiar inputs
        nombreInput.value = "";
        textoInput.value = "";

        // Remover mensaje "no hay comentarios"
        const noCommentsMsg = document.getElementById("noCommentsMsg");
        if (noCommentsMsg) noCommentsMsg.remove();

        // Renderizar el nuevo comentario inmediatamente con animación
        const card = document.createElement("div");
        card.className = "comment-card";
        card.innerHTML = `
            <div class="comment-meta">
                <span class="comment-author">${escapeHTML(nuevoComentario.nombre)}</span>
                <span>${nuevoComentario.fecha}</span>
            </div>
            <div class="comment-text">
                ${escapeHTML(nuevoComentario.texto).replace(/\n/g, "<br>")}
            </div>
        `;
        commentsList.appendChild(card);
    });

    // Carga inicial de comentarios
    cargarComentarios();
}

/* Helper para escapar HTML y evitar vulnerabilidades XSS */
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
