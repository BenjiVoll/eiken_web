import Swal from 'sweetalert2';

// Alerta de confirmación para eliminar
export async function deleteDataAlert() {
  return Swal.fire({
    title: "¿Estás seguro?",
    text: "¡No podrás revertir esto!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Si, eliminar!"
  });
}

// Alerta de éxito
export const showSuccessAlert = (titleMessage, message) => {
  Swal.fire(
    titleMessage,
    message,
    'success'
  );
};

// Alerta de error
export const showErrorAlert = (titleMessage, message) => {
  Swal.fire(
    titleMessage,
    message,
    'error'
  );
};

// Alerta de confirmación personalizada
export async function confirmAlert(title = "¿Estás seguro?", text = "Esta acción no se puede deshacer") {
  const result = await Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar"
  });
  return result.isConfirmed;
}

export const showConfirmAlert = confirmAlert;

export const showInfoAlert = (titleMessage, message) => {
  Swal.fire(
    titleMessage,
    message,
    'info'
  );
};


// Alerta de advertencia

export const showWarningAlert = (titleMessage, message) => {
  Swal.fire(
    titleMessage,
    message,
    'warning'
  );
};


//Alerta de carga

export const showLoadingAlert = (message = "Procesando...") => {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};


// Cerrar alerta actual

export const closeAlert = () => {
  Swal.close();
};


// Toast de notificación

export const showToast = (message, icon = 'success', timer = 3000) => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title: message,
    showConfirmButton: false,
    timer,
    timerProgressBar: true
  });
};


// Confirmación específica para crear

export async function createDataAlert(itemType = "elemento") {
  return Swal.fire({
    title: `¿Crear ${itemType}?`,
    text: `¿Estás seguro de que quieres crear este ${itemType}?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#28a745",
    cancelButtonColor: "#d33",
    confirmButtonText: "Si, crear!",
    cancelButtonText: "Cancelar"
  });
}


// Confirmación específica para actualizar

export async function updateDataAlert(itemType = "elemento") {
  return Swal.fire({
    title: `¿Actualizar ${itemType}?`,
    text: `¿Estás seguro de que quieres guardar los cambios?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#ffc107",
    cancelButtonColor: "#d33",
    confirmButtonText: "Si, actualizar!",
    cancelButtonText: "Cancelar"
  });
}
