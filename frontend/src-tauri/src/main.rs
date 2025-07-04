// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Command, Stdio};

fn main() {
    tauri::Builder::default()
        .setup(|_app| {
            Command::new("python")
                .args(["../python-api/app.py"])
                .stdout(Stdio::null())
                .spawn()
                .expect("Erreur au démarrage du backend Flask");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Erreur dans Tauri");
}
