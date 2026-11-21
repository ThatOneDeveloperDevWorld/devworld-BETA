/* i18n.js - Dev World language support (English / Español)
 * - Language is stored in localStorage ("devworld_lang") and applies to every page.
 * - Pages stay written in English; when Spanish or Japanese is selected, visible text,
 *   placeholders, tooltips, document titles and alert()/confirm() messages
 *   are translated from the dictionary below (exact-match lookups).
 * - To add/fix a translation, edit the ES (Spanish) or JA (Japanese) dictionary below.
 */
(function () {
    var KEY = "devworld_lang";

    var ES = {
        /* ---------- shared / navigation ---------- */
        "Loading...": "Cargando...",
        "Close": "Cerrar",
        "Cancel": "Cancelar",
        "Confirm": "Confirmar",
        "Back": "Atrás",
        "Back to Home": "Volver al inicio",
        "Back to Login": "Volver al inicio de sesión",
        "Return to Home": "Volver al inicio",
        "Home": "Inicio",
        "Menu": "Menú",
        "Wallet": "Cartera",
        "Posts": "Publicaciones",
        "Create": "Crear",
        "Profile": "Perfil",
        "Settings": "Ajustes",
        "Language": "Idioma",
        "Exit": "Salir",
        "Add": "Añadir",
        "Show More": "Mostrar más",
        "Error": "Error",
        "Dev World": "Dev World",
        "Dev World Logo": "Logotipo de Dev World",
        "Profile Picture": "Foto de perfil",
        "Game Icon": "Ícono del juego",
        "Warning Banner": "Banner de advertencia",
        "Banned Warning": "Aviso de suspensión",
        "Untitled": "Sin título",
        "Untitled Level": "Nivel sin título",
        "Untitled Game": "Juego sin título",
        "Unknown Creator": "Creador desconocido",
        "By Unknown": "Por desconocido",
        "By": "Por",
        "Game": "Juego",
        "Like": "Me gusta",
        "Coin": "Moneda",
        "Play ▶": "Jugar ▶",

        /* ---------- index / login ---------- */
        "START!": "¡EMPEZAR!",
        "Welcome to Dev World": "Bienvenido a Dev World",
        "Create Account": "Crear cuenta",
        "Login": "Iniciar sesión",
        "Login to Account": "Iniciar sesión en tu cuenta",
        "Username": "Nombre de usuario",
        "Email address": "Correo electrónico",
        "Password": "Contraseña",
        "Sign Up": "Registrarse",
        "OR": "O",
        "Sign up with Google": "Registrarse con Google",
        "Sign in with Google": "Iniciar sesión con Google",
        "Forgot password?": "¿Olvidaste tu contraseña?",
        "Characters and Scenery": "Personajes y escenario",
        "Please enter a username.": "Por favor, escribe un nombre de usuario.",
        "Please enter both email and password.": "Por favor, escribe tu correo y tu contraseña.",
        "Please enter your email address in the login email field first, then click 'Forgot password?'.": "Primero escribe tu correo en el campo de inicio de sesión y luego pulsa «¿Olvidaste tu contraseña?».",
        "Password reset email sent! Check your inbox.": "¡Correo para restablecer la contraseña enviado! Revisa tu bandeja de entrada.",
        "Google Sign-In failed:": "Falló el inicio de sesión con Google:",
        "nothing... :/": "nada... :/",
        "Nothing :/": "Nada :/",

        /* ---------- reset password ---------- */
        "Reset Password": "Restablecer contraseña",
        "Dev World - Reset Password": "Dev World - Restablecer contraseña",
        "Enter your account email address below, and we'll send you a secure link to reset your password.": "Escribe abajo el correo de tu cuenta y te enviaremos un enlace seguro para restablecer tu contraseña.",
        "Enter your email...": "Escribe tu correo...",
        "Send Reset Link": "Enviar enlace",
        "Please enter your email address.": "Por favor, escribe tu correo electrónico.",

        /* ---------- ban ---------- */
        "Account Suspended - Dev World": "Cuenta suspendida - Dev World",
        "Account permenatly banned": "Cuenta suspendida permanentemente",
        "Your account has been banned.": "Tu cuenta ha sido suspendida.",
        "Log Out": "Cerrar sesión",
        "ID: Not Signed In": "ID: Sin sesión iniciada",
        "Error logging out:": "Error al cerrar sesión:",

        /* ---------- home ---------- */
        "Dev World - Home": "Dev World - Inicio",
        "Find": "Buscar",
        "Search username...": "Buscar usuario...",
        "All Games": "Todos los juegos",
        "Create Game": "Crear juego",
        "Create a new game? Once published, this game will be public to everyone on Dev world.": "¿Crear un juego nuevo? Una vez publicado, será público para todos en Dev World.",
        "Failed to load games.": "No se pudieron cargar los juegos.",
        "No games published yet.": "Aún no hay juegos publicados.",
        "User not found!": "¡Usuario no encontrado!",
        "Lookup failed.": "La búsqueda falló.",

        /* ---------- posts ---------- */
        "Dev World - Posts": "Dev World - Publicaciones",
        "What's on your mind?": "¿Qué estás pensando?",
        "WOYM": "¿QEP?",
        "Loading posts...": "Cargando publicaciones...",
        "No posts yet. Be the first to share something!": "Aún no hay publicaciones. ¡Sé el primero en compartir algo!",
        "Failed to load posts feed.": "No se pudieron cargar las publicaciones.",
        "Create Post": "Crear publicación",
        "X": "X",
        "game(optional)": "juego (opcional)",
        "your text here...": "tu texto aquí...",
        "upload": "subir",
        "Log In Required": "Inicio de sesión requerido",
        "Log in to post...": "Inicia sesión para publicar...",
        "Log in to like posts.": "Inicia sesión para dar me gusta.",
        "Report": "Reportar",
        "Report Post": "Reportar publicación",
        "Please select a reason for reporting this post:": "Selecciona un motivo para reportar esta publicación:",
        "Inappropriate Content": "Contenido inapropiado",
        "Harassment or Bullying": "Acoso o intimidación",
        "Spam": "Spam",
        "Other": "Otro",
        "Optional details...": "Detalles opcionales...",
        "Send Report": "Enviar reporte",
        "Admin Delete Post": "Eliminar publicación (admin)",
        "Enter how many Dev Points to deduct from the author:": "Escribe cuántos Dev Points restar al autor:",
        "Delete Post & Deduct Points": "Eliminar publicación y restar puntos",
        "Delete Post": "Eliminar publicación",
        "Delete Game": "Eliminar juego",
        "Write a comment...": "Escribe un comentario...",
        "Please log in first to create a post.": "Primero inicia sesión para crear una publicación.",
        "You must be logged in to post.": "Debes iniciar sesión para publicar.",
        "You must be logged in to comment.": "Debes iniciar sesión para comentar.",
        "Post cannot be empty.": "La publicación no puede estar vacía.",
        "Post exceeds the 150-character limit.": "La publicación supera el límite de 150 caracteres.",
        "Post reported successfully. Thank you!": "Publicación reportada con éxito. ¡Gracias!",
        "Report sent, but webhook returned an error status.": "Reporte enviado, pero el webhook devolvió un error.",
        "Error sending report to server.": "Error al enviar el reporte al servidor.",
        "Unauthorized action.": "Acción no autorizada.",
        "Please enter a valid number of points.": "Por favor, escribe un número de puntos válido.",
        "Failed to post:": "No se pudo publicar:",
        "Failed to post comment:": "No se pudo publicar el comentario:",
        "Failed to delete post:": "No se pudo eliminar la publicación:",
        "Failed to delete game:": "No se pudo eliminar el juego:",

        /* ---------- profile ---------- */
        "My Profile - Dev World": "Mi perfil - Dev World",
        "Edit Profile": "Editar perfil",
        "Dev Points": "Dev Points",
        "Followers": "Seguidores",
        "Following": "Siguiendo",
        "Games By Me": "Mis juegos",
        "Posts By Me": "Mis publicaciones",
        "Loading games...": "Cargando juegos...",
        "Users": "Usuarios",
        "No users found.": "No se encontraron usuarios.",
        "No games created yet.": "Aún no has creado juegos.",
        "No posts shared yet.": "Aún no has compartido publicaciones.",
        "No badges assigned.": "Sin insignias asignadas.",
        "USERNAME": "NOMBRE DE USUARIO",
        "PROFILE PICTURE URL": "URL DE LA FOTO DE PERFIL",
        "PROFILE COLOR": "COLOR DEL PERFIL",
        "BIO": "BIOGRAFÍA",
        "Tell us about yourself...": "Cuéntanos sobre ti...",
        "ADMIN: MANAGE BADGES": "ADMIN: GESTIONAR INSIGNIAS",
        "e.g. developer, moderator": "p. ej. developer, moderator",
        "Save Profile": "Guardar perfil",
        "Delete Account": "Eliminar cuenta",
        "DELETE ACCOUNT?": "¿ELIMINAR CUENTA?",
        "Yes, Delete My Account": "Sí, eliminar mi cuenta",
        "Creator Profile": "Perfil de creador",
        "Building awesome games!": "¡Creando juegos geniales!",
        "Admin Action: Delete this user's game and deduct 10 Dev Points?": "Acción de admin: ¿eliminar el juego de este usuario y restar 10 Dev Points?",
        "Are you sure you want to delete this game?": "¿Seguro que quieres eliminar este juego?",
        "Are you sure you want to delete this post?": "¿Seguro que quieres eliminar esta publicación?",
        "Game deleted by admin. Author Dev Points reduced by 10.": "Juego eliminado por un admin. Se restaron 10 Dev Points al autor.",
        "Game deleted.": "Juego eliminado.",
        "Post deleted.": "Publicación eliminada.",
        "Profile updated successfully!": "¡Perfil actualizado con éxito!",
        "User already has this badge.": "El usuario ya tiene esta insignia.",
        "Your account has been successfully deleted.": "Tu cuenta se eliminó con éxito.",
        "For security reasons, please log out and log back in before deleting your account.": "Por seguridad, cierra sesión y vuelve a iniciarla antes de eliminar tu cuenta.",
        "Error adding badge:": "Error al añadir la insignia:",
        "Error removing badge:": "Error al quitar la insignia:",
        "Error deleting account:": "Error al eliminar la cuenta:",
        "Error saving:": "Error al guardar:",

        /* ---------- user profile ---------- */
        "search - dev world": "búsqueda - dev world",
        "Loading User...": "Cargando usuario...",
        "Loading bio...": "Cargando biografía...",
        "Follow": "Seguir",
        "Followed": "Siguiendo",
        "Published Games": "Juegos publicados",
        "ADMIN: MANAGE USER BADGES": "ADMIN: GESTIONAR INSIGNIAS DEL USUARIO",
        "Add Badge": "Añadir insignia",
        "ADMIN: MANAGE DEV POINTS": "ADMIN: GESTIONAR DEV POINTS",
        "New Dev Points (0-100)": "Nuevos Dev Points (0-100)",
        "Set Points": "Establecer puntos",
        "User Not Found": "Usuario no encontrado",
        "No ID specified in query.": "No se especificó ningún ID.",
        "Please provide a valid user link.": "Por favor, proporciona un enlace de usuario válido.",
        "This user profile does not exist.": "Este perfil de usuario no existe.",
        "No bio added yet.": "Aún no hay biografía.",
        "Could not fetch user record.": "No se pudo obtener el registro del usuario.",
        "No games published yet.": "Aún no hay juegos publicados.",
        "No badges assigned to this user.": "Este usuario no tiene insignias.",
        "Direct lookup fallback active": "Búsqueda directa de respaldo activa",
        "please sign into or create an account to follow users.": "inicia sesión o crea una cuenta para seguir a otros usuarios.",
        "Please enter a valid Dev Points value between 0 and 100.": "Por favor, escribe un valor de Dev Points entre 0 y 100.",
        "Failed to update follow status. Check console for details.": "No se pudo actualizar el seguimiento. Revisa la consola para más detalles.",
        "Error updating Dev Points:": "Error al actualizar los Dev Points:",
        "Error updating follow status:": "Error al actualizar el seguimiento:",

        /* ---------- wallet ---------- */
        "Dev World - Wallet": "Dev World - Cartera",
        "WALLET": "CARTERA",
        "Earn Dev Coins when players visit and play the games you create!": "¡Gana Dev Coins cuando los jugadores visiten y jueguen los juegos que creas!",

        /* ---------- feedback ---------- */
        "Dev World - Feedback": "Dev World - Comentarios",
        "Feedback Menu": "Menú de comentarios",
        "CATEGORY": "CATEGORÍA",
        "General": "General",
        "UI": "Interfaz",
        "Issues": "Problemas",
        "Account": "Cuenta",
        "Games": "Juegos",
        "Moderation": "Moderación",
        "Others": "Otros",
        "YOUR FEEDBACK": "TUS COMENTARIOS",
        "Send Feedback": "Enviar comentarios",
        "Tell us what you think or report a bug...": "Cuéntanos qué piensas o reporta un error...",
        "Please enter a feedback message before sending.": "Por favor, escribe un comentario antes de enviar.",
        "Thank you! Your feedback has been sent successfully.": "¡Gracias! Tus comentarios se enviaron con éxito.",
        "An error occurred while submitting feedback.": "Ocurrió un error al enviar tus comentarios.",
        "Failed to send feedback to Discord. Please try again later.": "No se pudieron enviar los comentarios a Discord. Inténtalo de nuevo más tarde.",

        /* ---------- download ---------- */
        "Dev World - Download Launcher": "Dev World - Descargar launcher",
        "Launcher for Windows": "Launcher para Windows",
        "Get the official Windows app": "Obtén la app oficial para Windows",
        "Launcher": "Launcher",
        "Windows Dev World Launcher": "Launcher de Dev World para Windows",

        /* ---------- guidelines ---------- */
        "Community Guidelines - Dev World": "Normas de la comunidad - Dev World",
        "← Back to App": "← Volver a la app",
        "🚨 Dev World Community Guidelines 🚨": "🚨 Normas de la comunidad de Dev World 🚨",
        "Created: August 4th 2026 | Last Updated: November 2nd 2026": "Creado: 4 de agosto de 2026 | Última actualización: 2 de noviembre de 2026",
        "No drama": "Sin dramas",
        "No spamming": "Sin spam",
        "No malicious links": "Sin enlaces maliciosos",
        "• Phishing links, fake login links, info stealer links, cookie logger links, IP logger links, etc.": "• Enlaces de phishing, enlaces falsos de inicio de sesión, enlaces que roban información, enlaces que registran cookies o IP, etc.",
        "No doxxing": "Sin doxxing",
        "No harassment": "Sin acoso",
        "• Includes bullying and targeted intimidation.": "• Incluye el bullying y la intimidación dirigida.",
        "No inappropriate content": "Sin contenido inapropiado",
        "No self-promotion": "Sin autopromoción",
        "No alts meant for bypassing bans": "Sin cuentas alternativas para evadir suspensiones",
        "• Creating alternate accounts to evade an active ban will result in the immediate and permanent removal of all associated accounts.": "• Crear cuentas alternativas para evadir una suspensión activa provocará la eliminación inmediata y permanente de todas las cuentas asociadas.",
        "Moderators and Admins have the final say.": "Los moderadores y administradores tienen la última palabra.",
        "🚨 Direct Ban System": "🚨 Sistema de suspensión directa",

        /* ---------- reported post ---------- */
        "Reported Post Review - Dev World": "Revisión de publicación reportada - Dev World",
        "Reported Post Inspection": "Inspección de publicación reportada",
        "Reporter:": "Reportado por:",
        "Post ID:": "ID de la publicación:",
        "Creator ID:": "ID del creador:",
        "Report Message / Content:": "Mensaje / contenido del reporte:",
        "No details provided": "Sin detalles",

        /* ---------- play ---------- */
        "Dev World - Play": "Dev World - Jugar",
        "Loading Level...": "Cargando nivel...",
        "TEST MODE": "MODO DE PRUEBA",
        "Community Level": "Nivel de la comunidad",
        "No test level data found.": "No se encontraron datos del nivel de prueba.",
        "Level does not exist.": "El nivel no existe.",
        "No level selected.": "Ningún nivel seleccionado.",

        /* ---------- editor ---------- */
        "Dev World - Studio": "Dev World - Estudio",
        "Game Title": "Título del juego",
        "Grid Size": "Tamaño de cuadrícula",
        "Background Color": "Color de fondo",
        "Select Category": "Seleccionar categoría",
        "Blocks and Tiles": "Bloques y baldosas",
        "Decor and Elements": "Decoración y elementos",
        "Hazards and Spikes": "Peligros y pinchos",
        "Custom Tiles": "Baldosas personalizadas",
        "Test Play": "Probar",
        "Publish Game": "Publicar juego",
        "Studio Settings": "Ajustes del estudio",
        "Game Preview": "Vista previa del juego",
        "Custom Tile": "Baldosa personalizada",
        "Add Custom Tile": "Añadir baldosa personalizada",
        "Saved!": "¡Guardado!",
        "Name your awesome level...": "Ponle nombre a tu nivel genial...",
        "link here...": "enlace aquí...",
        "name...": "nombre...",
        "Preview Icon": "Vista previa del ícono",
        "Invalid format! Only .gif, .png, .jpg, and .jpeg are allowed.": "¡Formato no válido! Solo se permiten .gif, .png, .jpg y .jpeg.",
        "Invalid image format! Only .gif, .png, .jpg, and .jpeg allowed.": "¡Formato de imagen no válido! Solo se permiten .gif, .png, .jpg y .jpeg.",
        "Grass": "Césped",
        "Dirt": "Tierra",
        "Brick": "Ladrillo",
        "Sand": "Arena",
        "Water": "Agua",
        "Bridge": "Puente",
        "Player Spawn": "Aparición del jugador",
        "Cloud": "Nube",
        "Bush": "Arbusto",
        "Tree": "Árbol",
        "Spike": "Pincho",
        "Lava": "Lava",
        "Custom tile added!": "¡Baldosa personalizada añadida!",
        "Please enter a custom game title to publish!": "¡Escribe un título para el juego antes de publicarlo!",
        "Please enter a custom tile name!": "¡Escribe un nombre para la baldosa personalizada!",
        "Please enter a valid image URL ending in .png, .jpg, .jpeg, or .gif": "Escribe una URL de imagen válida que termine en .png, .jpg, .jpeg o .gif",
        "Please fix your game icon URL or leave it blank.": "Corrige la URL del ícono del juego o déjala en blanco.",
        "Publishing...": "Publicando...",
        "Published successfully!": "¡Publicado con éxito!",
        "Publish failed:": "Error al publicar:",

        /* ---------- Dev World CREATE ---------- */
        "Dev World CREATE": "Dev World CREATE",
        "DEV WORLD CREATE": "DEV WORLD CREATE",
        "Connecting...": "Conectando...",
        "⚙️ Settings": "⚙️ Ajustes",
        "MY PROJECTS": "MIS PROYECTOS",
        "+ New Project": "+ Nuevo proyecto",
        "New Project": "Nuevo proyecto",
        "Manage Project": "Administrar proyecto",
        "Loading creator workspace...": "Cargando espacio de creador...",
        "Loading your projects...": "Cargando tus proyectos...",
        "Show More Projects": "Mostrar más proyectos",
        "Edit Game": "Editar juego",
        "Game Name:": "Nombre del juego:",
        "Enter game title...": "Escribe el título del juego...",
        "Custom Game Icon URL (.png, .jpg, .jpeg, .gif):": "URL del ícono personalizado (.png, .jpg, .jpeg, .gif):",
        "Icon Spec:": "Especificación del ícono:",
        "Recommended 128x128 resolution. Icons can be hosted directly via your GitHub repository.": "Resolución recomendada: 128x128. Los íconos se pueden alojar directamente en tu repositorio de GitHub.",
        "ICON PREVIEW (128x128)": "VISTA PREVIA DEL ÍCONO (128x128)",
        "Icon Preview": "Vista previa del ícono",
        "Save Project": "Guardar proyecto",
        "Creator Settings": "Ajustes de creador",
        "Update Username:": "Actualizar nombre de usuario:",
        "Enter new username...": "Escribe un nuevo nombre de usuario...",
        "Save Changes": "Guardar cambios",
        "Not Logged In": "Sin sesión iniciada",
        "Failed to load creator projects.": "No se pudieron cargar los proyectos del creador.",
        "Please log in through Dev World to access Dev World CREATE.": "Inicia sesión en Dev World para acceder a Dev World CREATE.",
        "No projects found in your games collection. Click \"+ New Project\" to start building!": "No se encontraron proyectos en tu colección de juegos. ¡Pulsa «+ Nuevo proyecto» para empezar a crear!",
        "Please enter a game name.": "Por favor, escribe un nombre para el juego.",
        "Username cannot be empty.": "El nombre de usuario no puede estar vacío.",
        "Username updated successfully!": "¡Nombre de usuario actualizado con éxito!",
        "Invalid image link. Only .gif, .png, .jpg, and .jpeg files are accepted.": "Enlace de imagen no válido. Solo se aceptan archivos .gif, .png, .jpg y .jpeg.",
        "Failed to save project:": "No se pudo guardar el proyecto:",
        "Failed to update username:": "No se pudo actualizar el nombre de usuario:",

        /* ---------- tutorial ---------- */
        "hello, new guy.": "hola, novato.",
        "i see you havent learned basic things yet.": "veo que aún no has aprendido lo básico.",
        "lets fix that :D": "vamos a arreglar eso :D",
        "make game": "crea un juego",
        "find settings": "encuentra los ajustes",
        "change game icon": "cambia el ícono del juego",
        "add custom tiles": "añade baldosas personalizadas",
        "change game name": "cambia el nombre del juego",
        "add tiles too game": "añade baldosas al juego",
        "publish": "publica",
        "Click anywhere to continue ▶": "Toca en cualquier lugar para continuar ▶",

        /* ---------- misc ---------- */
        "Fork": "Bifurcar",
        "Forked from": "Bifurcado de",
        "Forking:": "Bifurcando:",
        "Fork loaded!": "¡Fork cargado!",
        "Could not load the game to fork.": "No se pudo cargar el juego para bifurcar.",
        "Reply": "Responder",
        "Edit Info": "Editar información",
        "Open Editor": "Abrir editor",
        "Editor": "Editor",
        "Download starting soon...": "La descarga comenzará pronto...",
        "ID: Loading...": "ID: Cargando...",

        /* ---------- game menu ---------- */
        "Enter": "Entrar",
        "Share": "Compartir",
        "Report Creator": "Reportar creador",
        "Report Game": "Reportar juego",
        "like": "me gusta",
        "likes": "me gusta",
        "Created": "Creado",
        "Updated": "Actualizado",
        "Comments": "Comentarios",
        "Show your thoughts": "Muestra lo que piensas",
        "Post": "Publicar",
        "Delete": "Eliminar",
        "Replying to": "Respondiendo a",
        "Comment deleted": "Comentario eliminado",
        "Unknown": "Desconocido",
        "Loading comments...": "Cargando comentarios...",
        "Failed to load comments.": "No se pudieron cargar los comentarios.",
        "No comments yet. Be the first!": "Aún no hay comentarios. ¡Sé el primero!",
        "Link copied!": "¡Enlace copiado!",
        "Please wait a few seconds.": "Espera unos segundos.",
        "Please select a reason for reporting this game:": "Selecciona un motivo para reportar este juego:",
        "Please select a reason for reporting this creator:": "Selecciona un motivo para reportar a este creador:",
        "Game not found.": "Juego no encontrado.",
        "Could not load this game.": "No se pudo cargar este juego.",
        "Log in to like games.": "Inicia sesión para dar me gusta a los juegos.",
        "Log in to comment.": "Inicia sesión para comentar.",
        "Failed to update like.": "No se pudo actualizar el me gusta.",
        "Failed to update follow status.": "No se pudo actualizar el estado de seguimiento.",
        "Failed to post comment.": "No se pudo publicar el comentario.",
        "Delete this comment?": "¿Eliminar este comentario?",
        "Failed to delete comment.": "No se pudo eliminar el comentario.",
        "Please log in to send a report.": "Inicia sesión para enviar un reporte.",
        "Please wait a bit before sending another report.": "Espera un poco antes de enviar otro reporte.",
        "Report sent. Thank you!": "Reporte enviado. ¡Gracias!",
        "Failed to send report. Please try again later.": "No se pudo enviar el reporte. Inténtalo de nuevo más tarde.",
        "Game Banner": "Banner del juego",
        "Banner Preview": "Vista previa del banner",
        "Please fix your game banner URL or leave it blank.": "Corrige la URL del banner de tu juego o déjala en blanco.",
        "Game Description": "Descripción del juego",
        "describe your game...": "describe tu juego..."
    };

    /* Sentences that contain bold/inline markup: pages mark them with
       data-i18n-html="<english text>" and get this HTML when Spanish is on. */
    var ES_HTML = {
        "devpoints-explain": "estos son tus <b>dev points</b>. cuanto más bajes, más <b>restringido</b> estarás.",
        "delete-warning": "Advertencia: esta acción es permanente y <strong>no se puede deshacer</strong>. Todos tus datos se borrarán por completo.",
        "user-banned": "este usuario ha sido suspendido. ya no puede usar <b>dev world</b> con esta cuenta.",
        "ban-system": "A diferencia del servidor de Discord, Dev World <strong>NO</strong> usa un contador de advertencias. Las infracciones de estas normas conllevan directamente silenciamientos o suspensiones permanentes de la plataforma."
    };

    /* Dynamic strings containing numbers / names. */
    var PATTERNS = [
        [/^(\d+) visits$/, "$1 visitas"],
        [/^Visits: (\d+)$/, "Visitas: $1"],
        [/^Post deleted by admin\. Author Dev Points reduced by (.+)\.$/, "Publicación eliminada por un admin. Se restaron $1 Dev Points al autor."],
        [/^Successfully updated Dev Points to (.+)\.$/, "Dev Points actualizados con éxito a $1."],
        [/^you have followed (.+)$/, "has seguido a $1"],
        [/^Your account has been banned\. reason: dev points = (.+)\.$/, "Tu cuenta ha sido suspendida. motivo: dev points = $1."]
    ];

    var JA = {
        /* ---------- shared / navigation ---------- */
        "Loading...": "読み込み中...",
        "Close": "閉じる",
        "Cancel": "キャンセル",
        "Confirm": "確認",
        "Back": "戻る",
        "Back to Home": "ホームに戻る",
        "Back to Login": "ログインに戻る",
        "Return to Home": "ホームに戻る",
        "Home": "ホーム",
        "Menu": "メニュー",
        "Wallet": "ウォレット",
        "Posts": "投稿",
        "Create": "作成",
        "Profile": "プロフィール",
        "Settings": "設定",
        "Language": "言語",
        "Exit": "終了",
        "Add": "追加",
        "Show More": "もっと見る",
        "Error": "エラー",
        "Dev World": "Dev World",
        "Dev World Logo": "Dev World ロゴ",
        "Profile Picture": "プロフィール画像",
        "Game Icon": "ゲームアイコン",
        "Warning Banner": "警告バナー",
        "Banned Warning": "BAN警告",
        "Untitled": "無題",
        "Untitled Level": "無題のレベル",
        "Untitled Game": "無題のゲーム",
        "Unknown Creator": "不明なクリエイター",
        "By Unknown": "作成者: 不明",
        "By": "作成者",
        "Game": "ゲーム",
        "Like": "いいね",
        "Coin": "コイン",
        "Play ▶": "プレイ ▶",

        /* ---------- index / login ---------- */
        "START!": "スタート！",
        "Welcome to Dev World": "Dev World へようこそ",
        "Create Account": "アカウント作成",
        "Login": "ログイン",
        "Login to Account": "アカウントにログイン",
        "Username": "ユーザー名",
        "Email address": "メールアドレス",
        "Password": "パスワード",
        "Sign Up": "登録する",
        "OR": "または",
        "Sign up with Google": "Googleで登録",
        "Sign in with Google": "Googleでログイン",
        "Forgot password?": "パスワードを忘れましたか？",
        "Characters and Scenery": "キャラクターと風景",
        "Please enter a username.": "ユーザー名を入力してください。",
        "Please enter both email and password.": "メールアドレスとパスワードの両方を入力してください。",
        "Please enter your email address in the login email field first, then click 'Forgot password?'.": "先にログイン欄にメールアドレスを入力してから、「パスワードを忘れましたか？」をクリックしてください。",
        "Password reset email sent! Check your inbox.": "パスワード再設定メールを送信しました！受信トレイをご確認ください。",
        "Google Sign-In failed:": "Googleログインに失敗しました:",
        "nothing... :/": "なし... :/",
        "Nothing :/": "なし :/",

        /* ---------- reset password ---------- */
        "Reset Password": "パスワード再設定",
        "Dev World - Reset Password": "Dev World - パスワード再設定",
        "Enter your account email address below, and we'll send you a secure link to reset your password.": "アカウントのメールアドレスを入力してください。パスワード再設定用の安全なリンクをお送りします。",
        "Enter your email...": "メールアドレスを入力...",
        "Send Reset Link": "再設定リンクを送信",
        "Please enter your email address.": "メールアドレスを入力してください。",

        /* ---------- ban ---------- */
        "Account Suspended - Dev World": "アカウント停止 - Dev World",
        "Account permenatly banned": "アカウントは永久BANされました",
        "Your account has been banned.": "あなたのアカウントはBANされました。",
        "Log Out": "ログアウト",
        "ID: Not Signed In": "ID: 未ログイン",
        "Error logging out:": "ログアウト中にエラーが発生しました:",

        /* ---------- home ---------- */
        "Dev World - Home": "Dev World - ホーム",
        "Find": "検索",
        "Search username...": "ユーザー名を検索...",
        "All Games": "すべてのゲーム",
        "Create Game": "ゲームを作成",
        "Create a new game? Once published, this game will be public to everyone on Dev world.": "新しいゲームを作成しますか？公開すると、Dev World の全員に公開されます。",
        "Failed to load games.": "ゲームを読み込めませんでした。",
        "No games published yet.": "公開されたゲームはまだありません。",
        "User not found!": "ユーザーが見つかりません！",
        "Lookup failed.": "検索に失敗しました。",

        /* ---------- posts ---------- */
        "Dev World - Posts": "Dev World - 投稿",
        "What's on your mind?": "今なにしてる？",
        "WOYM": "今なにしてる？",
        "Loading posts...": "投稿を読み込み中...",
        "No posts yet. Be the first to share something!": "まだ投稿がありません。最初に何かシェアしよう！",
        "Failed to load posts feed.": "投稿を読み込めませんでした。",
        "Create Post": "投稿を作成",
        "X": "X",
        "game(optional)": "ゲーム（任意）",
        "your text here...": "ここに文章を入力...",
        "upload": "投稿",
        "Log In Required": "ログインが必要です",
        "Log in to post...": "ログインして投稿...",
        "Log in to like posts.": "いいねするにはログインしてください。",
        "Report": "報告",
        "Report Post": "投稿を報告",
        "Please select a reason for reporting this post:": "この投稿を報告する理由を選んでください:",
        "Inappropriate Content": "不適切なコンテンツ",
        "Harassment or Bullying": "嫌がらせ・いじめ",
        "Spam": "スパム",
        "Other": "その他",
        "Optional details...": "詳細（任意）...",
        "Send Report": "報告を送信",
        "Admin Delete Post": "投稿を削除（管理者）",
        "Enter how many Dev Points to deduct from the author:": "投稿者から減らす Dev Points の数を入力してください:",
        "Delete Post & Deduct Points": "投稿を削除してポイントを減らす",
        "Delete Post": "投稿を削除",
        "Delete Game": "ゲームを削除",
        "Write a comment...": "コメントを書く...",
        "Please log in first to create a post.": "投稿するには先にログインしてください。",
        "You must be logged in to post.": "投稿するにはログインが必要です。",
        "You must be logged in to comment.": "コメントするにはログインが必要です。",
        "Post cannot be empty.": "投稿を空にすることはできません。",
        "Post exceeds the 150-character limit.": "投稿が150文字の上限を超えています。",
        "Post reported successfully. Thank you!": "投稿を報告しました。ありがとうございます！",
        "Report sent, but webhook returned an error status.": "報告は送信されましたが、Webhookがエラーを返しました。",
        "Error sending report to server.": "サーバーへの報告送信中にエラーが発生しました。",
        "Unauthorized action.": "許可されていない操作です。",
        "Please enter a valid number of points.": "有効なポイント数を入力してください。",
        "Failed to post:": "投稿に失敗しました:",
        "Failed to post comment:": "コメントの投稿に失敗しました:",
        "Failed to delete post:": "投稿の削除に失敗しました:",
        "Failed to delete game:": "ゲームの削除に失敗しました:",

        /* ---------- profile ---------- */
        "My Profile - Dev World": "マイプロフィール - Dev World",
        "Edit Profile": "プロフィールを編集",
        "Dev Points": "Dev Points",
        "Followers": "フォロワー",
        "Following": "フォロー中",
        "Games By Me": "自分のゲーム",
        "Posts By Me": "自分の投稿",
        "Loading games...": "ゲームを読み込み中...",
        "Users": "ユーザー",
        "No users found.": "ユーザーが見つかりません。",
        "No games created yet.": "まだゲームを作成していません。",
        "No posts shared yet.": "まだ投稿していません。",
        "No badges assigned.": "バッジはありません。",
        "USERNAME": "ユーザー名",
        "PROFILE PICTURE URL": "プロフィール画像のURL",
        "PROFILE COLOR": "プロフィールの色",
        "BIO": "自己紹介",
        "Tell us about yourself...": "自己紹介を書いてください...",
        "ADMIN: MANAGE BADGES": "管理者: バッジ管理",
        "e.g. developer, moderator": "例: developer, moderator",
        "Save Profile": "プロフィールを保存",
        "Delete Account": "アカウントを削除",
        "DELETE ACCOUNT?": "アカウントを削除しますか？",
        "Yes, Delete My Account": "はい、アカウントを削除します",
        "Creator Profile": "クリエイタープロフィール",
        "Building awesome games!": "すごいゲームを作っています！",
        "Admin Action: Delete this user's game and deduct 10 Dev Points?": "管理者操作: このユーザーのゲームを削除し、Dev Points を10減らしますか？",
        "Are you sure you want to delete this game?": "このゲームを本当に削除しますか？",
        "Are you sure you want to delete this post?": "この投稿を本当に削除しますか？",
        "Game deleted by admin. Author Dev Points reduced by 10.": "管理者がゲームを削除しました。作者の Dev Points が10減りました。",
        "Game deleted.": "ゲームを削除しました。",
        "Post deleted.": "投稿を削除しました。",
        "Profile updated successfully!": "プロフィールを更新しました！",
        "User already has this badge.": "このユーザーはすでにこのバッジを持っています。",
        "Your account has been successfully deleted.": "アカウントを削除しました。",
        "For security reasons, please log out and log back in before deleting your account.": "セキュリティのため、アカウントを削除する前に一度ログアウトして再ログインしてください。",
        "Error adding badge:": "バッジの追加中にエラーが発生しました:",
        "Error removing badge:": "バッジの削除中にエラーが発生しました:",
        "Error deleting account:": "アカウント削除中にエラーが発生しました:",
        "Error saving:": "保存中にエラーが発生しました:",

        /* ---------- user profile ---------- */
        "search - dev world": "検索 - dev world",
        "Loading User...": "ユーザーを読み込み中...",
        "Loading bio...": "自己紹介を読み込み中...",
        "Follow": "フォロー",
        "Followed": "フォロー中",
        "Published Games": "公開ゲーム",
        "ADMIN: MANAGE USER BADGES": "管理者: ユーザーのバッジ管理",
        "Add Badge": "バッジを追加",
        "ADMIN: MANAGE DEV POINTS": "管理者: Dev Points 管理",
        "New Dev Points (0-100)": "新しい Dev Points (0-100)",
        "Set Points": "ポイントを設定",
        "User Not Found": "ユーザーが見つかりません",
        "No ID specified in query.": "IDが指定されていません。",
        "Please provide a valid user link.": "有効なユーザーリンクを指定してください。",
        "This user profile does not exist.": "このユーザープロフィールは存在しません。",
        "No bio added yet.": "自己紹介はまだありません。",
        "Could not fetch user record.": "ユーザー情報を取得できませんでした。",
        "No badges assigned to this user.": "このユーザーにはバッジがありません。",
        "Direct lookup fallback active": "直接検索のフォールバックが有効です",
        "please sign into or create an account to follow users.": "ユーザーをフォローするには、ログインまたはアカウント作成をしてください。",
        "Please enter a valid Dev Points value between 0 and 100.": "0〜100の有効な Dev Points の値を入力してください。",
        "Failed to update follow status. Check console for details.": "フォロー状態の更新に失敗しました。詳細はコンソールを確認してください。",
        "Error updating Dev Points:": "Dev Points の更新中にエラーが発生しました:",
        "Error updating follow status:": "フォロー状態の更新中にエラーが発生しました:",

        /* ---------- wallet ---------- */
        "Dev World - Wallet": "Dev World - ウォレット",
        "WALLET": "ウォレット",
        "Earn Dev Coins when players visit and play the games you create!": "あなたが作ったゲームにプレイヤーが訪れて遊ぶと、Dev Coins がもらえます！",

        /* ---------- feedback ---------- */
        "Dev World - Feedback": "Dev World - フィードバック",
        "Feedback Menu": "フィードバックメニュー",
        "CATEGORY": "カテゴリー",
        "General": "一般",
        "UI": "UI",
        "Issues": "不具合",
        "Account": "アカウント",
        "Games": "ゲーム",
        "Moderation": "モデレーション",
        "Others": "その他",
        "YOUR FEEDBACK": "フィードバック内容",
        "Send Feedback": "フィードバックを送信",
        "Tell us what you think or report a bug...": "ご意見やバグ報告をお聞かせください...",
        "Please enter a feedback message before sending.": "送信する前にフィードバックを入力してください。",
        "Thank you! Your feedback has been sent successfully.": "ありがとうございます！フィードバックを送信しました。",
        "An error occurred while submitting feedback.": "フィードバックの送信中にエラーが発生しました。",
        "Failed to send feedback to Discord. Please try again later.": "Discordへのフィードバック送信に失敗しました。後でもう一度お試しください。",

        /* ---------- download ---------- */
        "Dev World - Download Launcher": "Dev World - ランチャーのダウンロード",
        "Launcher for Windows": "Windows用ランチャー",
        "Get the official Windows app": "公式Windowsアプリを入手",
        "Launcher": "ランチャー",
        "Windows Dev World Launcher": "Windows用 Dev World ランチャー",

        /* ---------- guidelines ---------- */
        "Community Guidelines - Dev World": "コミュニティガイドライン - Dev World",
        "← Back to App": "← アプリに戻る",
        "🚨 Dev World Community Guidelines 🚨": "🚨 Dev World コミュニティガイドライン 🚨",
        "Created: August 4th 2026 | Last Updated: November 2nd 2026": "作成日: 2026年8月4日 | 最終更新: 2026年11月2日",
        "No drama": "ドラマ禁止",
        "No spamming": "スパム禁止",
        "No malicious links": "悪意のあるリンク禁止",
        "• Phishing links, fake login links, info stealer links, cookie logger links, IP logger links, etc.": "• フィッシングリンク、偽ログインリンク、情報窃取リンク、Cookie・IPロガーのリンクなど。",
        "No doxxing": "個人情報の晒し禁止",
        "No harassment": "嫌がらせ禁止",
        "• Includes bullying and targeted intimidation.": "• いじめや特定の相手への威嚇を含みます。",
        "No inappropriate content": "不適切なコンテンツ禁止",
        "No self-promotion": "自己宣伝禁止",
        "No alts meant for bypassing bans": "BAN回避用のサブアカウント禁止",
        "• Creating alternate accounts to evade an active ban will result in the immediate and permanent removal of all associated accounts.": "• 有効なBANを回避するためにサブアカウントを作成した場合、関連するすべてのアカウントが直ちに永久に削除されます。",
        "Moderators and Admins have the final say.": "モデレーターと管理者が最終的な判断を行います。",
        "🚨 Direct Ban System": "🚨 即時BANシステム",

        /* ---------- reported post ---------- */
        "Reported Post Review - Dev World": "報告された投稿の確認 - Dev World",
        "Reported Post Inspection": "報告された投稿の確認",
        "Reporter:": "報告者:",
        "Post ID:": "投稿ID:",
        "Creator ID:": "作成者ID:",
        "Report Message / Content:": "報告メッセージ / 内容:",
        "No details provided": "詳細なし",

        /* ---------- play ---------- */
        "Dev World - Play": "Dev World - プレイ",
        "Loading Level...": "レベルを読み込み中...",
        "TEST MODE": "テストモード",
        "Community Level": "コミュニティレベル",
        "No test level data found.": "テスト用のレベルデータが見つかりません。",
        "Level does not exist.": "レベルが存在しません。",
        "No level selected.": "レベルが選択されていません。",

        /* ---------- editor ---------- */
        "Dev World - Studio": "Dev World - スタジオ",
        "Game Title": "ゲームタイトル",
        "Grid Size": "グリッドサイズ",
        "Background Color": "背景色",
        "Select Category": "カテゴリーを選択",
        "Blocks and Tiles": "ブロックとタイル",
        "Decor and Elements": "装飾とパーツ",
        "Hazards and Spikes": "危険物とトゲ",
        "Custom Tiles": "カスタムタイル",
        "Test Play": "テストプレイ",
        "Publish Game": "ゲームを公開",
        "Studio Settings": "スタジオ設定",
        "Game Preview": "ゲームプレビュー",
        "Custom Tile": "カスタムタイル",
        "Add Custom Tile": "カスタムタイルを追加",
        "Saved!": "保存しました！",
        "Name your awesome level...": "すごいレベルに名前をつけよう...",
        "link here...": "リンクをここに...",
        "name...": "名前...",
        "Preview Icon": "アイコンのプレビュー",
        "Invalid format! Only .gif, .png, .jpg, and .jpeg are allowed.": "形式が正しくありません！使えるのは .gif、.png、.jpg、.jpeg のみです。",
        "Invalid image format! Only .gif, .png, .jpg, and .jpeg allowed.": "画像形式が正しくありません！使えるのは .gif、.png、.jpg、.jpeg のみです。",
        "Grass": "草",
        "Dirt": "土",
        "Brick": "レンガ",
        "Sand": "砂",
        "Water": "水",
        "Bridge": "橋",
        "Player Spawn": "プレイヤー開始位置",
        "Cloud": "雲",
        "Bush": "茂み",
        "Tree": "木",
        "Spike": "トゲ",
        "Lava": "溶岩",
        "Custom tile added!": "カスタムタイルを追加しました！",
        "Please enter a custom game title to publish!": "公開するにはゲームタイトルを入力してください！",
        "Please enter a custom tile name!": "カスタムタイルの名前を入力してください！",
        "Please enter a valid image URL ending in .png, .jpg, .jpeg, or .gif": ".png、.jpg、.jpeg、.gif のいずれかで終わる有効な画像URLを入力してください",
        "Please fix your game icon URL or leave it blank.": "ゲームアイコンのURLを修正するか、空欄にしてください。",
        "Publishing...": "公開中...",
        "Published successfully!": "公開しました！",
        "Publish failed:": "公開に失敗しました:",

        /* ---------- Dev World CREATE ---------- */
        "Dev World CREATE": "Dev World CREATE",
        "DEV WORLD CREATE": "DEV WORLD CREATE",
        "Connecting...": "接続中...",
        "⚙️ Settings": "⚙️ 設定",
        "MY PROJECTS": "マイプロジェクト",
        "+ New Project": "+ 新規プロジェクト",
        "New Project": "新規プロジェクト",
        "Manage Project": "プロジェクト管理",
        "Loading creator workspace...": "クリエイターワークスペースを読み込み中...",
        "Loading your projects...": "プロジェクトを読み込み中...",
        "Show More Projects": "プロジェクトをもっと見る",
        "Edit Game": "ゲームを編集",
        "Game Name:": "ゲーム名:",
        "Enter game title...": "ゲームタイトルを入力...",
        "Custom Game Icon URL (.png, .jpg, .jpeg, .gif):": "カスタムゲームアイコンのURL (.png, .jpg, .jpeg, .gif):",
        "Icon Spec:": "アイコン仕様:",
        "Recommended 128x128 resolution. Icons can be hosted directly via your GitHub repository.": "推奨解像度は128x128です。アイコンはGitHubリポジトリから直接ホストできます。",
        "ICON PREVIEW (128x128)": "アイコンのプレビュー (128x128)",
        "Icon Preview": "アイコンのプレビュー",
        "Save Project": "プロジェクトを保存",
        "Creator Settings": "クリエイター設定",
        "Update Username:": "ユーザー名を更新:",
        "Enter new username...": "新しいユーザー名を入力...",
        "Save Changes": "変更を保存",
        "Not Logged In": "未ログイン",
        "Failed to load creator projects.": "クリエイターのプロジェクトを読み込めませんでした。",
        "Please log in through Dev World to access Dev World CREATE.": "Dev World CREATE を使うには、Dev World からログインしてください。",
        "No projects found in your games collection. Click \"+ New Project\" to start building!": "ゲームコレクションにプロジェクトが見つかりません。「+ 新規プロジェクト」をクリックして作り始めましょう！",
        "Please enter a game name.": "ゲーム名を入力してください。",
        "Username cannot be empty.": "ユーザー名を空にすることはできません。",
        "Username updated successfully!": "ユーザー名を更新しました！",
        "Invalid image link. Only .gif, .png, .jpg, and .jpeg files are accepted.": "画像リンクが正しくありません。使えるのは .gif、.png、.jpg、.jpeg ファイルのみです。",
        "Failed to save project:": "プロジェクトの保存に失敗しました:",
        "Failed to update username:": "ユーザー名の更新に失敗しました:",

        /* ---------- tutorial ---------- */
        "hello, new guy.": "こんにちは、新入りさん。",
        "i see you havent learned basic things yet.": "まだ基本を学んでいないようだね。",
        "lets fix that :D": "それを直しちゃおう :D",
        "make game": "ゲームを作る",
        "find settings": "設定を探す",
        "change game icon": "ゲームアイコンを変える",
        "add custom tiles": "カスタムタイルを追加する",
        "change game name": "ゲーム名を変える",
        "add tiles too game": "ゲームにタイルを追加する",
        "publish": "公開する",
        "Click anywhere to continue ▶": "どこでもクリックして続ける ▶",

        /* ---------- misc ---------- */
        "Fork": "フォーク",
        "Forked from": "フォーク元:",
        "Forking:": "フォーク中:",
        "Fork loaded!": "フォークを読み込みました！",
        "Could not load the game to fork.": "フォークするゲームを読み込めませんでした。",
        "Reply": "返信",
        "Edit Info": "情報を編集",
        "Open Editor": "エディターを開く",
        "Editor": "エディター",
        "Download starting soon...": "まもなくダウンロードが始まります...",
        "ID: Loading...": "ID: 読み込み中...",

        /* ---------- game menu ---------- */
        "Enter": "プレイ",
        "Share": "共有",
        "Report Creator": "作者を報告",
        "Report Game": "ゲームを報告",
        "like": "いいね",
        "likes": "いいね",
        "Created": "作成日",
        "Updated": "更新日",
        "Comments": "コメント",
        "Show your thoughts": "感想を書こう",
        "Post": "投稿",
        "Delete": "削除",
        "Replying to": "返信先",
        "Comment deleted": "コメントは削除されました",
        "Unknown": "不明",
        "Loading comments...": "コメントを読み込み中...",
        "Failed to load comments.": "コメントを読み込めませんでした。",
        "No comments yet. Be the first!": "まだコメントはありません。最初のコメントを書こう！",
        "Link copied!": "リンクをコピーしました！",
        "Please wait a few seconds.": "数秒お待ちください。",
        "Please select a reason for reporting this game:": "このゲームを報告する理由を選んでください:",
        "Please select a reason for reporting this creator:": "この作者を報告する理由を選んでください:",
        "Game not found.": "ゲームが見つかりません。",
        "Could not load this game.": "このゲームを読み込めませんでした。",
        "Log in to like games.": "ゲームにいいねするにはログインしてください。",
        "Log in to comment.": "コメントするにはログインしてください。",
        "Failed to update like.": "いいねを更新できませんでした。",
        "Failed to update follow status.": "フォロー状態を更新できませんでした。",
        "Failed to post comment.": "コメントを投稿できませんでした。",
        "Delete this comment?": "このコメントを削除しますか？",
        "Failed to delete comment.": "コメントを削除できませんでした。",
        "Please log in to send a report.": "報告するにはログインしてください。",
        "Please wait a bit before sending another report.": "次の報告を送るまで少しお待ちください。",
        "Report sent. Thank you!": "報告を送信しました。ありがとうございます！",
        "Failed to send report. Please try again later.": "報告を送信できませんでした。後でもう一度お試しください。",
        "Game Banner": "ゲームバナー",
        "Banner Preview": "バナーのプレビュー",
        "Please fix your game banner URL or leave it blank.": "ゲームバナーのURLを修正するか、空欄のままにしてください。",
        "Game Description": "ゲームの説明",
        "describe your game...": "ゲームについて書いてみよう..."
    };

    var JA_HTML = {
        "devpoints-explain": "これはあなたの<b>dev points</b>です。下がるほど<b>制限</b>が厳しくなります。",
        "delete-warning": "警告: この操作は永久的で、<strong>元に戻すことはできません</strong>。すべてのデータが完全に削除されます。",
        "user-banned": "このユーザーはBANされました。このアカウントでは<b>dev world</b>を利用できません。",
        "ban-system": "Discordサーバーとは異なり、Dev World では警告回数を<strong>使いません</strong>。これらのルールに違反すると、ミュートまたはプラットフォームからの永久BANに直接つながります。"
    };

    var JA_PATTERNS = [
        [/^(\d+) visits$/, "$1 回訪問"],
        [/^Visits: (\d+)$/, "訪問数: $1"],
        [/^Post deleted by admin\. Author Dev Points reduced by (.+)\.$/, "管理者が投稿を削除しました。作者の Dev Points が$1減りました。"],
        [/^Successfully updated Dev Points to (.+)\.$/, "Dev Points を$1に更新しました。"],
        [/^you have followed (.+)$/, "$1 をフォローしました"],
        [/^Your account has been banned\. reason: dev points = (.+)\.$/, "あなたのアカウントはBANされました。理由: dev points = $1。"]
    ];

    var DICTS = { es: ES, ja: JA };
    var HTMLS = { es: ES_HTML, ja: JA_HTML };
    var PATS  = { es: PATTERNS, ja: JA_PATTERNS };

    var lang = "en";
    try { var saved = localStorage.getItem(KEY); lang = (saved === "es" || saved === "ja") ? saved : "en"; } catch (e) {}

    function norm(s) { return s.replace(/\s+/g, " ").trim(); }

    function lookup(core, loose) {
        var D = DICTS[lang], P = PATS[lang];
        if (!D) return null;
        var has = function (k) { return Object.prototype.hasOwnProperty.call(D, k); };
        if (has(core)) return D[core];
        for (var i = 0; i < P.length; i++) {
            if (P[i][0].test(core)) return core.replace(P[i][0], P[i][1]);
        }
        if (loose) {
            // "Error saving: <details>" -> translate the head, keep the details
            var idx = core.indexOf(": ");
            if (idx > 0) {
                var head = core.slice(0, idx + 1), tail = core.slice(idx + 1);
                if (has(head)) return D[head] + tail;
                if (has(core.slice(0, idx))) return D[core.slice(0, idx)] + ":" + tail;
            }
            if (/^Error: /.test(core)) return core;
            var m = core.match(/^(.*\S:)\s*(.+)$/);
            if (m && has(m[1])) return D[m[1]] + " " + m[2];
        }
        return null;
    }

    // Translate a string (keeps surrounding whitespace). Returns the input if no translation.
    function t(str, loose) {
        if (lang === "en" || typeof str !== "string" || !str) return str;
        var m = str.match(/^(\s*)([\s\S]*?)(\s*)$/);
        var core = norm(m[2]);
        if (!core) return str;
        var out = lookup(core, loose);
        return out == null ? str : m[1] + out + m[3];
    }

    /* ---------- DOM translation ---------- */
    var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1, CODE: 1, PRE: 1 };
    var ATTRS = ["placeholder", "title", "alt", "aria-label"];

    function skipEl(el) {
        for (var n = el; n && n.nodeType === 1; n = n.parentNode) {
            if (SKIP_TAGS[n.tagName]) return true;
            if (n.hasAttribute && (n.hasAttribute("data-no-i18n") || n.hasAttribute("data-i18n-done"))) {
                if (n !== el || n.hasAttribute("data-no-i18n")) return true;
            }
            if (n.classList && n.classList.contains("notranslate")) return true;
        }
        return false;
    }

    function translateTextNode(node) {
        var p = node.parentNode;
        if (!p || skipEl(p)) return;
        var v = node.nodeValue;
        if (!v || !/[A-Za-z]/.test(v)) return;
        var out = t(v);
        if (out !== v) node.nodeValue = out;
    }

    function translateElement(el) {
        if (el.nodeType !== 1 || SKIP_TAGS[el.tagName]) return;
        var key = el.getAttribute("data-i18n-html");
        if (key !== null) {
            if (HTMLS[lang][key] && el.getAttribute("data-i18n-done") !== "1") {
                el.innerHTML = HTMLS[lang][key];
                el.setAttribute("data-i18n-done", "1");
            }
            return;
        }
        if (el.hasAttribute("data-no-i18n") || el.classList.contains("notranslate")) return;
        for (var i = 0; i < ATTRS.length; i++) {
            var a = el.getAttribute(ATTRS[i]);
            if (a) { var o = t(a); if (o !== a) el.setAttribute(ATTRS[i], o); }
        }
        if (el.tagName === "INPUT" && (el.type === "button" || el.type === "submit") && el.value) {
            var ov = t(el.value); if (ov !== el.value) el.value = ov;
        }
        for (var c = el.firstChild; c; c = c.nextSibling) {
            if (c.nodeType === 3) translateTextNode(c);
            else if (c.nodeType === 1) translateElement(c);
        }
    }

    function translateTree(root) {
        if (lang === "en" || !root) return;
        if (root.nodeType === 3) translateTextNode(root);
        else if (root.nodeType === 1) translateElement(root);
    }

    function start() {
        if (lang === "en") return;
        document.documentElement.setAttribute("lang", lang);
        var tt = t(document.title);
        if (tt !== document.title) document.title = tt;
        translateTree(document.body);
        new MutationObserver(function (muts) {
            for (var i = 0; i < muts.length; i++) {
                var m = muts[i];
                if (m.type === "childList") {
                    for (var j = 0; j < m.addedNodes.length; j++) translateTree(m.addedNodes[j]);
                } else if (m.type === "characterData") {
                    translateTextNode(m.target);
                } else if (m.type === "attributes" && m.target.nodeType === 1) {
                    translateElement(m.target);
                }
            }
        }).observe(document.body, {
            childList: true, subtree: true, characterData: true,
            attributes: true, attributeFilter: ATTRS
        });
        var titleEl = document.querySelector("title");
        if (titleEl) new MutationObserver(function () {
            var cur = document.title, o = t(cur);
            if (o !== cur) document.title = o;
        }).observe(titleEl, { childList: true, characterData: true, subtree: true });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();

    /* ---------- alert / confirm / prompt ---------- */
    var _alert = window.alert, _confirm = window.confirm, _prompt = window.prompt;
    window.alert = function (msg) { return _alert.call(window, typeof msg === "string" ? t(msg, true) : msg); };
    window.confirm = function (msg) { return _confirm.call(window, typeof msg === "string" ? t(msg, true) : msg); };
    window.prompt = function (msg, def) { return _prompt.call(window, typeof msg === "string" ? t(msg, true) : msg, def); };

    /* ---------- public API ---------- */
    window.DWLang = {
        get: function () { return lang; },
        set: function (code) {
            code = (code === "es" || code === "ja") ? code : "en";
            try { localStorage.setItem(KEY, code); } catch (e) {}
            location.reload();   // re-render the page cleanly in the chosen language
        },
        t: t,
        dict: ES,
        dicts: DICTS
    };
})();
