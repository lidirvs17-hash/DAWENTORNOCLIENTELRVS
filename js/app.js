// Referencias al Formulario
const formulario = document.getElementById('formCita');
const tablaCuerpo = document.getElementById('cuerpoTabla');

// Referencias a los inputs (para validar y limpiar)
const inputNombre = document.getElementById('nombre');
const inputApellidos = document.getElementById('apellidos');
const inputDni = document.getElementById('dni');
const inputTelefono = document.getElementById('telefono');
const inputFechaNac = document.getElementById('fechaNac');
const inputFecha = document.getElementById('fecha');
const inputHora = document.getElementById('hora');
const inputObservaciones = document.getElementById('observaciones');
//-----------------------------------------------------------------------------------------
// Clase Cita 
//-----------------------------------------------------------------------------------------
class Cita {
    constructor(nombre, apellidos, dni, telefono, fechaNac, fecha, hora, observaciones) {
        this.id = Date.now(); // Identificador único oculto
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.dni = dni;
        this.telefono = telefono;
        this.fechaNac = fechaNac;
        this.fecha = fecha;
        this.hora = hora;
        this.observaciones = observaciones;
    }
}

let listaCitas = [];
//-----------------------------------------------------------------------------------------
// Función para validar el formulario
//-----------------------------------------------------------------------------------------
function validarFormulario() {
    let esValido = true;

    // 1. Limpiar errores previos 
    const mensajesError = document.querySelectorAll('.error-msg');
    mensajesError.forEach(msg => msg.innerText = "");
    const inputs = document.querySelectorAll('input');
    inputs.forEach(inp => inp.classList.remove('input-error'));

    // 2. Validar Nombre (No puede estar vacío)
    if (inputNombre.value.trim() === "") {
        document.getElementById('errorNombre').innerText = "El nombre es obligatorio.";
        inputNombre.classList.add('input-error');
        esValido = false;
    }

    // 3. Validar Teléfono (Uso de parseInt y isNaN)
    // El teléfono no puede ser una cadena de texto
    const telValue = inputTelefono.value;
    if (isNaN(telValue) || telValue.length !== 9) { 
        document.getElementById('errorTelefono').innerText = "El teléfono debe ser un número de 9 dígitos.";
        inputTelefono.classList.add('input-error');
        esValido = false;
    }

    // 4. Validar DNI (expresión regular básica)
    const dniRegEx = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
    if (!dniRegEx.test(inputDni.value)) {
        document.getElementById('errorDni').innerText = "DNI no válido (8 números y 1 letra).";
        inputDni.classList.add('input-error');
        esValido = false;
    }

    // 5. Validar Fecha 
    if (inputFecha.value === "") {
        document.getElementById('errorFecha').innerText = "Debes seleccionar una fecha.";
        inputFecha.classList.add('input-error');
        esValido = false;
    }

    return esValido; // Si algo falló, devuelve false y no se crea la cita
}
//-----------------------------------------------------------------------------------------
// Manejo del evento 'submit' del formulario
//----------------------------------------------------------------------------------------

// Escuchar el evento 'submit' del formulario 
formulario.addEventListener('submit', function(event) {
    event.preventDefault(); 

    if (validarFormulario()) {
        const idEdicion = document.getElementById('editandoId').value;

        if (idEdicion === "") {
            // MODO CREACIÓN: No hay ID en el campo oculto
            const nuevaCita = new Cita(
                inputNombre.value, inputApellidos.value, inputDni.value,
                inputTelefono.value, inputFechaNac.value, inputFecha.value,
                inputHora.value, inputObservaciones.value
            );
            listaCitas.push(nuevaCita); // Insertar en array 
        } else {
            // MODO EDICIÓN: Buscamos el índice de la cita existente 
            const index = listaCitas.findIndex(c => c.id == idEdicion);
            
            // Actualizamos los datos de esa posición
            listaCitas[index].nombre = inputNombre.value;
            listaCitas[index].apellidos = inputApellidos.value;
            listaCitas[index].dni = inputDni.value;
            listaCitas[index].telefono = inputTelefono.value;
            listaCitas[index].fechaNac = inputFechaNac.value;
            listaCitas[index].fecha = inputFecha.value;
            listaCitas[index].hora = inputHora.value;
            listaCitas[index].observaciones = inputObservaciones.value;

            // Limpiamos el modo edición
            document.getElementById('editandoId').value = "";
            document.getElementById('btnGuardar').innerText = "Guardar Cita";
        }

        guardarCitasEnCookie();
        renderizarTabla();
        formulario.reset();
    }
});
//-----------------------------------------------------------------------------------------
// Función para renderizar la tabla de citas
//-----------------------------------------------------------------------------------------
function renderizarTabla() {
    // 1. Limpiamos el cuerpo de la tabla para no duplicar datos
    tablaCuerpo.innerHTML = "";

    // 2. Comprobamos si hay citas (Requisito del enunciado)
    if (listaCitas.length === 0) {
        tablaCuerpo.innerHTML = `<tr id="filaVacia"><td colspan="6">Dato vacío</td></tr>`;
        return;
    }

    // 3. Recorremos el array y creamos las filas (Tema 6: Iteración)
    listaCitas.forEach((cita, index) => {
        const fila = document.createElement('tr');
        
        // Guardamos el ID en un atributo oculto (dataset) para poder borrar/editar luego
        fila.setAttribute('data-id', cita.id);

        fila.innerHTML = `
            <td>${index + 1}</td>
            <td>${cita.fecha} ${cita.hora}</td>
            <td>${cita.nombre} ${cita.apellidos}</td>
            <td>${cita.dni}</td>
            <td>${cita.telefono}</td>
            <td>
                <button class="btn-editar" onclick="cargarCitaParaEditar(${cita.id})">Editar</button>
                <button class="btn-eliminar" onclick="eliminarCita(${cita.id})">Eliminar</button>
            </td>
        `;
        
        tablaCuerpo.appendChild(fila); // Añadimos el nodo al DOM (tabla)
    });
}
//-----------------------------------------------------------------------------------------
// Función para eliminar una cita
//-----------------------------------------------------------------------------------------
function eliminarCita(id) {
    // Filtramos el array para quitar la cita con el ID seleccionado
    listaCitas = listaCitas.filter(cita => cita.id !== id);
    
    // Guardamos los cambios en la cookie (persistencia)
    guardarCitasEnCookie();
    
   
    renderizarTabla();
}
//-----------------------------------------------------------------------------------------
// Funciones para persistencia con Cookies
//-----------------------------------------------------------------------------------------
function guardarCitasEnCookie() {
    // Convertimos el array de objetos a una cadena JSON 
    const datosJSON = JSON.stringify(listaCitas);
    // Creamos la cookie con una duración de 7 días
    const d = new Date();
    d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = "citasDavante=" + datosJSON + ";" + expires + ";path=/";
}

function cargarCitasDeCookie() {
    const nombre = "citasDavante=";
    const cookiesDecodificadas = decodeURIComponent(document.cookie);
    const arrayCookies = cookiesDecodificadas.split(';');
    
    for(let i = 0; i < arrayCookies.length; i++) {
        let c = arrayCookies[i].trim();
        if (c.indexOf(nombre) == 0) {
            const contenido = c.substring(nombre.length, c.length);
            // Transformamos la cadena de nuevo a un Array de objetos 
            listaCitas = JSON.parse(contenido);
            return;
        }
    }
}
//-----------------------------------------------------------------------------------------
// Función para editar: carga los datos en el formulario 
//-----------------------------------------------------------------------------------------
function cargarCitaParaEditar(id) {
    const cita = listaCitas.find(c => c.id === id);
    
    if (cita) {
        // Rellenamos los campos normales
        inputNombre.value = cita.nombre;
        inputApellidos.value = cita.apellidos;
        inputDni.value = cita.dni;
        inputTelefono.value = cita.telefono;
        inputFechaNac.value = cita.fechaNac;
        inputFecha.value = cita.fecha;
        inputHora.value = cita.hora;
        inputObservaciones.value = cita.observaciones;

        // Guardamos el ID en el campo oculto
        document.getElementById('editandoId').value = id;
        
        // Cambiamos el texto del botón para que el usuario sepa que está editando
        document.getElementById('btnGuardar').innerText = "Actualizar Cita";
    }
}

//-----------------------------------------------------------------------------------------
// Inicialización al cargar la página 
//-----------------------------------------------------------------------------------------
window.onload = function() {
    cargarCitasDeCookie();
    renderizarTabla();
};
//-----------------------------------------------------------------------------------------
// Manejo del evento 'reset' del formulario
//-----------------------------------------------------------------------------------------
formulario.addEventListener('reset', function() {
    // Limpiamos el ID de edición y restauramos el botón
    document.getElementById('editandoId').value = "";
    document.getElementById('btnGuardar').innerText = "Guardar Cita";
    
    // Quitamos los estilos de error visuales si los hubiera
    const inputs = document.querySelectorAll('input');
    inputs.forEach(inp => inp.classList.remove('input-error'));
});