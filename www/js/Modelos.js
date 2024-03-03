class UsuarioLogin {
    constructor(nombre,password){
        this.usuario = nombre;
        this.password = password;
    }
    /* Metodos */
}

class Usuario {
    constructor(nombre,password,idPais,caloriasDiarias){
        this.usuario = nombre;
        this.password = password;
        this.idPais = idPais;
        this.caloriasDiarias = caloriasDiarias;
    }
    /* Metodos */
}

class Comida {
    constructor(idAlimento,idUsuario,cantidad,fecha){
        this.idAlimento = idAlimento;
        this.idUsuario = idUsuario;
        this.cantidad = cantidad;
        this.fecha = this.mostrarFecha(fecha);
    }
    /* Metodos */

    mostrarFecha(fecha){
        return fecha;
    }
}

