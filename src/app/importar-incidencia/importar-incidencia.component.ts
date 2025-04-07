import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatDialogRef } from "@angular/material/dialog";
import { InspectorService } from "../services/inspector.service"
import Swal from "sweetalert2"

@Component({
  selector: "app-importar-incidencia",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./importar-incidencia.component.html",
  styleUrl: "./importar-incidencia.component.css",
})
export class ImportarIncidenciaComponent {
  isDragging = false
  selectedFile: File | null = null
  errorMessage = ""

  constructor(
    public dialogRef: MatDialogRef<ImportarIncidenciaComponent>,
    private inspectorService: InspectorService,
  ) {}

  // Método para manejar el evento dragover
  onDragOver(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    this.isDragging = true
  }

  // Método para manejar el evento dragleave
  onDragLeave(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    this.isDragging = false
  }

  // Método para manejar el evento drop
  onDrop(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    this.isDragging = false

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0]
      this.validateAndSetFile(file)
    }
  }

  // Método para manejar la selección de archivo mediante el input
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      const file = input.files[0]
      this.validateAndSetFile(file)
    }
  }

  // Método para validar y establecer el archivo seleccionado
  validateAndSetFile(file: File): void {
    this.errorMessage = ""

    // Validar que sea un archivo CSV
    if (!file.name.toLowerCase().endsWith(".csv")) {
      this.errorMessage = "Por favor, selecciona un archivo CSV válido."
      return
    }

    // Validar tamaño del archivo (por ejemplo, máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB en bytes
    if (file.size > maxSize) {
      this.errorMessage = "El archivo es demasiado grande. El tamaño máximo es 5MB."
      return
    }

    this.selectedFile = file
  }

  // Método para eliminar el archivo seleccionado
  removeFile(): void {
    this.selectedFile = null
    this.errorMessage = ""
  }

  // Método para cerrar el diálogo
  close(): void {
    this.dialogRef.close(false)
  }

  // Método para importar el archivo
  importarArchivo(): void {
    if (!this.selectedFile) {
      this.errorMessage = "Por favor, selecciona un archivo CSV."
      return
    }

    // Mostrar mensaje de carga
    Swal.fire({
      title: "Importando...",
      text: "Procesando el archivo CSV",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })

    // Llamar al servicio para importar el archivo
    this.inspectorService.importarIncidencia(this.selectedFile).subscribe(
      (response) => {
        // Mostrar mensaje de éxito
        Swal.fire({
          title: "¡Importación completada!",
          text: "La incidencia ha sido actualizada correctamente",
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#1a4b8c",
        }).then(() => {
          // Cerrar el diálogo y devolver true para indicar éxito
          this.dialogRef.close(true)
        })
      },
      (error) => {
        // Mostrar mensaje de error
        let errorMsg = "No se pudo importar el archivo CSV."

        // Si hay un mensaje de error específico del servidor, mostrarlo
        if (error.error && error.error.error) {
          errorMsg = error.error.error
        }

        Swal.fire({
          title: "Error",
          text: errorMsg,
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#8c1a20",
        })
      },
    )
  }
}

