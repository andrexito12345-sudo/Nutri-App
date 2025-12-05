// src/utils/nutritionalFormulas.js

// --- 1. TASA METABÓLICA BASAL (TMB / BMR) ---
export const calculateBMR = (weight, height, age, gender, formula = 'mifflin') => {
    // Validaciones básicas
    if (!weight || !height || !age || !gender) return 0;

    const w = parseFloat(weight);
    const h = parseFloat(height); // cm
    const a = parseFloat(age);
    const isMale = gender.toLowerCase() === 'masculino';

    let bmr = 0;

    switch (formula) {
        case 'harris-benedict': // Clásica
            if (isMale) {
                bmr = 66.5 + (13.75 * w) + (5.003 * h) - (6.755 * a);
            } else {
                bmr = 655.1 + (9.563 * w) + (1.850 * h) - (4.676 * a);
            }
            break;

        case 'mifflin': // Mifflin-St Jeor (Estándar actual)
            const s = isMale ? 5 : -161;
            bmr = (10 * w) + (6.25 * h) - (5 * a) + s;
            break;

        case 'fao-oms': // FAO/OMS (Por rangos de edad)
            // Simplificado para adultos 18-30, 30-60, >60
            if (isMale) {
                if (a < 30) bmr = (15.3 * w) + 679;
                else if (a < 60) bmr = (11.6 * w) + 879;
                else bmr = (13.5 * w) + 487;
            } else {
                if (a < 30) bmr = (14.7 * w) + 496;
                else if (a < 60) bmr = (8.7 * w) + 829;
                else bmr = (10.5 * w) + 596;
            }
            break;

        case 'quick': // Método Rápido (Kcal/kg)
            // Asumimos un promedio de 22 kcal/kg para TMB
            bmr = w * 22;
            break;

        default:
            bmr = 0;
    }

    return Math.round(bmr);
};

// --- 2. GASTO ENERGÉTICO TOTAL (GET / TDEE) ---
export const calculateTDEE = (bmr, activityLevel, stressFactor = 1.0) => {
    // activityLevel: 1.2, 1.375, 1.55, 1.725, 1.9
    return Math.round(bmr * parseFloat(activityLevel) * parseFloat(stressFactor));
};

// --- 3. DISTRIBUCIÓN DE MACROS ---
export const calculateMacros = (calories, proteinPct, carbsPct, fatsPct) => {
    // 1g Proteína = 4 kcal
    // 1g Carbohidrato = 4 kcal
    // 1g Grasa = 9 kcal

    return {
        protein: {
            grams: Math.round((calories * (proteinPct / 100)) / 4),
            calories: Math.round(calories * (proteinPct / 100))
        },
        carbs: {
            grams: Math.round((calories * (carbsPct / 100)) / 4),
            calories: Math.round(calories * (carbsPct / 100))
        },
        fats: {
            grams: Math.round((calories * (fatsPct / 100)) / 9),
            calories: Math.round(calories * (fatsPct / 100))
        }
    };
};