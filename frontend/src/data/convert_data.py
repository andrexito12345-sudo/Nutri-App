import pandas as pd
import json
import os

# ==========================================
# 1. CONFIGURACIÓN
# ==========================================
ARCHIVO_CSV = "tabla_usfq_con_grupo.csv"
# CAMBIO: Quitamos la ruta "src/data/" porque ya estás dentro de esa carpeta
ARCHIVO_SALIDA = "foodDatabase.js" 

COLUMNAS = {
    "id": "id_alimento",
    "grupo": "Grupo",
    "alimento": "Alimento",
    "fuente": "Fuente",
    "kcal": "Energia_kcal",
    "proteina": "Proteina_g",
    "grasas": "Grasa_total_g",
    "carbohidratos": "Carbohidratos_g",
    "fibra": "Fibra_g",
    "ags": "AGS_g",
    "agm": "AGM_g",
    "agpi": "AGPI_g",
    "colesterol": "Colesterol_mg",
    "calcio": "Calcio_mg",
    "fosforo": "Fosforo_mg",
    "hierro": "Hierro_mg",
    "potasio": "Potasio_mg",
    "sodio": "Sodio_mg",
    "zinc": "Zinc_mg",
    "vitamina_c": "VitaminaC_mg",
    "vitamina_a": "VitaminaA_ug_ERE",
    "folatos": "Folatos_ug",
    "vitamina_b12": "VitaminaB12_ug"
}

def limpiar_valor(valor):
    try:
        if isinstance(valor, str):
            valor = valor.replace(",", ".")
        if pd.isnull(valor) or str(valor).strip() == "":
            return 0
        return float(valor)
    except:
        return 0

# ==========================================
# 2. PROCESAMIENTO
# ==========================================
try:
    print(f"📂 Intentando leer: {ARCHIVO_CSV}...")
    
    # Intentamos leer con soporte para BOM (utf-8-sig arregla los caracteres raros del inicio)
    try:
        df = pd.read_csv(ARCHIVO_CSV, sep=';', encoding='utf-8-sig', on_bad_lines='skip', engine='python')
    except:
        try:
            df = pd.read_csv(ARCHIVO_CSV, sep=',', encoding='utf-8-sig', on_bad_lines='skip', engine='python')
        except:
            df = pd.read_csv(ARCHIVO_CSV, sep=',', encoding='latin-1', on_bad_lines='skip', engine='python')

    # Limpiar nombres de columnas (quita espacios y caracteres raros)
    df.columns = df.columns.str.strip().str.replace('ï»¿', '')
    
    print(f"✅ Archivo leído. Filas detectadas: {len(df)}")
    
    alimentos_js = []
    
    for index, row in df.iterrows():
        try:
            # Función auxiliar para buscar columnas ignorando mayúsculas/minúsculas
            def get_val(key):
                col_name = COLUMNAS.get(key)
                if col_name in df.columns:
                    return row[col_name]
                return 0

            item = {
                "id": str(row.get(COLUMNAS["id"], index)),
                "grupo": str(row.get(COLUMNAS["grupo"], "Varios")).strip(),
                "alimento": str(row.get(COLUMNAS["alimento"], "Desconocido")).strip(),
                "medida": "100g",
                "peso": 100,
                
                # Macros
                "kcal": limpiar_valor(get_val("kcal")),
                "proteina": limpiar_valor(get_val("proteina")),
                "grasas": limpiar_valor(get_val("grasas")),
                "carbohidratos": limpiar_valor(get_val("carbohidratos")),
                
                # Detalles
                "detalles": {
                    "fibra": limpiar_valor(get_val("fibra")),
                    "calcio": limpiar_valor(get_val("calcio")),
                    "hierro": limpiar_valor(get_val("hierro")),
                    "vit_c": limpiar_valor(get_val("vitamina_c")),
                }
            }
            alimentos_js.append(item)
            
        except Exception as e:
            continue

    # Guardar archivo JS
    js_content = f"""export const foodDatabase = {json.dumps(alimentos_js, indent=2, ensure_ascii=False)};

export const foodGroups = [...new Set(foodDatabase.map(item => item.grupo))].filter(Boolean).sort();
"""

    with open(ARCHIVO_SALIDA, "w", encoding="utf-8") as f:
        f.write(js_content)

    print(f"🎉 ¡ÉXITO! Se generó '{ARCHIVO_SALIDA}' con {len(alimentos_js)} alimentos.")

except Exception as e:
    print(f"❌ Error crítico: {e}")