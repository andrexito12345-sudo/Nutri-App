// ============================================
// FÓRMULAS NUTRICIONALES PROFESIONALES
// Sistema de cálculo de requerimientos energéticos y macronutrientes
// ============================================

/**
 * TASA METABÓLICA BASAL (TMB)
 * Calcula el gasto energético en reposo
 */

// 1. FÓRMULA DE HARRIS-BENEDICT (Revisada 1984)
export const calculateTMB_HarrisBenedict = (weight, height, age, gender) => {
    if (gender === 'Masculino') {
        return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
};

// 2. FÓRMULA DE MIFFLIN-ST JEOR (Más moderna y precisa)
export const calculateTMB_Mifflin = (weight, height, age, gender) => {
    if (gender === 'Masculino') {
        return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
};

// 3. FÓRMULA FAO/OMS (Organización Mundial de la Salud)
export const calculateTMB_FAO = (weight, height, age, gender) => {
    if (gender === 'Masculino') {
        if (age < 30) {
            return (15.3 * weight) + 679;
        } else if (age < 60) {
            return (11.6 * weight) + 879;
        } else {
            return (13.5 * weight) + 487;
        }
    } else {
        if (age < 30) {
            return (14.7 * weight) + 496;
        } else if (age < 60) {
            return (8.7 * weight) + 829;
        } else {
            return (10.5 * weight) + 596;
        }
    }
};

// 4. FÓRMULA RÁPIDA (25-30 kcal/kg) - Estimación simple
export const calculateTMB_Quick = (weight, gender) => {
    const factor = gender === 'Masculino' ? 27.5 : 25;
    return weight * factor;
};

/**
 * GASTO ENERGÉTICO TOTAL (GET)
 * TMB multiplicado por factor de actividad física
 */

// Factores de actividad física estandarizados
export const ACTIVITY_FACTORS = {
    'Sedentario': 1.2,           // Poco o ningún ejercicio
    'Ligero': 1.375,             // Ejercicio ligero 1-3 días/semana
    'Moderado': 1.55,            // Ejercicio moderado 3-5 días/semana
    'Activo': 1.725,             // Ejercicio intenso 6-7 días/semana
    'Muy Activo': 1.9            // Ejercicio muy intenso, trabajo físico
};

export const calculateGET = (tmb, activityLevel) => {
    const factor = ACTIVITY_FACTORS[activityLevel] || 1.2;
    return tmb * factor;
};

/**
 * FACTOR DE ESTRÉS/ENFERMEDAD
 * Aumenta requerimientos según condición clínica
 */

export const STRESS_FACTORS = {
    'Normal': 1.0,
    'Cirugía menor': 1.1,
    'Infección moderada': 1.2,
    'Cirugía mayor': 1.3,
    'Sepsis': 1.4,
    'Trauma severo': 1.5,
    'Quemaduras (10-30%)': 1.5,
    'Quemaduras (30-50%)': 1.75,
    'Quemaduras (>50%)': 2.0
};

export const applyStressFactor = (get, stressFactor) => {
    const factor = STRESS_FACTORS[stressFactor] || 1.0;
    return get * factor;
};

/**
 * AJUSTE SEGÚN OBJETIVO
 * Déficit o superávit calórico para pérdida/ganancia de peso
 */

export const adjustForGoal = (calories, goal) => {
    switch(goal) {
        case 'Pérdida de peso':
            return {
                calories: Math.round(calories * 0.8), // -20%
                min: Math.round(calories * 0.75),
                max: Math.round(calories * 0.85),
                deficit: Math.round(calories * 0.2)
            };
        case 'Pérdida de peso agresiva':
            return {
                calories: Math.round(calories * 0.7), // -30%
                min: Math.round(calories * 0.65),
                max: Math.round(calories * 0.75),
                deficit: Math.round(calories * 0.3)
            };
        case 'Mantenimiento':
            return {
                calories: Math.round(calories),
                min: Math.round(calories * 0.95),
                max: Math.round(calories * 1.05),
                deficit: 0
            };
        case 'Ganancia de peso':
            return {
                calories: Math.round(calories * 1.15), // +15%
                min: Math.round(calories * 1.1),
                max: Math.round(calories * 1.2),
                surplus: Math.round(calories * 0.15)
            };
        case 'Ganancia muscular':
            return {
                calories: Math.round(calories * 1.2), // +20%
                min: Math.round(calories * 1.15),
                max: Math.round(calories * 1.25),
                surplus: Math.round(calories * 0.2)
            };
        default:
            return {
                calories: Math.round(calories),
                min: Math.round(calories * 0.95),
                max: Math.round(calories * 1.05),
                deficit: 0
            };
    }
};

/**
 * REQUERIMIENTO DE PROTEÍNA
 * Según objetivo y condición
 */

export const calculateProteinRequirement = (weight, goal, condition = 'Normal') => {
    let proteinPerKg;

    // Ajuste por condición especial
    if (condition === 'Enfermedad renal') {
        proteinPerKg = 0.8;
    } else if (condition === 'Diabetes') {
        proteinPerKg = 1.0;
    } else if (condition === 'Hipertensión') {
        proteinPerKg = 1.0;
    } else {
        // Ajuste por objetivo
        switch(goal) {
            case 'Pérdida de peso':
            case 'Pérdida de peso agresiva':
                proteinPerKg = 1.6; // Mayor proteína para preservar masa muscular
                break;
            case 'Ganancia muscular':
                proteinPerKg = 2.0; // Alta proteína para hipertrofia
                break;
            case 'Ganancia de peso':
                proteinPerKg = 1.4;
                break;
            default:
                proteinPerKg = 1.2; // Mantenimiento
        }
    }

    const proteinGrams = weight * proteinPerKg;
    const proteinCalories = proteinGrams * 4; // 4 kcal por gramo

    return {
        grams: Math.round(proteinGrams),
        calories: Math.round(proteinCalories),
        perKg: proteinPerKg,
        percentage: 0 // Se calculará después
    };
};

/**
 * DISTRIBUCIÓN DE MACRONUTRIENTES
 * Calcula proteína, carbohidratos y grasas
 */

export const calculateMacronutrients = (totalCalories, weight, goal, condition = 'Normal') => {
    // 1. PROTEÍNA (prioritaria)
    const protein = calculateProteinRequirement(weight, goal, condition);

    // 2. GRASAS (20-35% de calorías totales)
    let fatPercentage;
    if (goal === 'Ganancia muscular') {
        fatPercentage = 0.25; // 25% para favorecer testosterona
    } else if (goal === 'Pérdida de peso') {
        fatPercentage = 0.25; // 25% moderado
    } else if (condition === 'Diabetes') {
        fatPercentage = 0.30; // 30% para control glucémico
    } else {
        fatPercentage = 0.28; // 28% estándar
    }

    const fatCalories = totalCalories * fatPercentage;
    const fatGrams = Math.round(fatCalories / 9); // 9 kcal por gramo

    // 3. CARBOHIDRATOS (el resto de calorías)
    const carbCalories = totalCalories - protein.calories - fatCalories;
    const carbGrams = Math.round(carbCalories / 4); // 4 kcal por gramo

    // Actualizar porcentajes
    protein.percentage = Math.round((protein.calories / totalCalories) * 100);
    const carbPercentage = Math.round((carbCalories / totalCalories) * 100);

    return {
        protein: {
            grams: protein.grams,
            calories: protein.calories,
            percentage: protein.percentage
        },
        carbs: {
            grams: carbGrams > 0 ? carbGrams : 0,
            calories: Math.round(carbCalories > 0 ? carbCalories : 0),
            percentage: carbPercentage > 0 ? carbPercentage : 0
        },
        fats: {
            grams: fatGrams,
            calories: Math.round(fatCalories),
            percentage: Math.round(fatPercentage * 100)
        }
    };
};

/**
 * DISTRIBUCIÓN POR TIEMPO DE COMIDA
 * Sugerencia de distribución de calorías en el día
 */

export const distributeMealCalories = (totalCalories, numberOfMeals = 5) => {
    const distributions = {
        3: { // 3 comidas
            'Desayuno': 0.30,
            'Almuerzo': 0.40,
            'Cena': 0.30
        },
        4: { // 4 comidas
            'Desayuno': 0.25,
            'Colación AM': 0.10,
            'Almuerzo': 0.40,
            'Cena': 0.25
        },
        5: { // 5 comidas (recomendado)
            'Desayuno': 0.25,
            'Colación AM': 0.10,
            'Almuerzo': 0.30,
            'Colación PM': 0.10,
            'Cena': 0.25
        },
        6: { // 6 comidas
            'Desayuno': 0.20,
            'Colación AM': 0.10,
            'Almuerzo': 0.30,
            'Colación PM': 0.10,
            'Cena': 0.20,
            'Colación Noche': 0.10
        }
    };

    const distribution = distributions[numberOfMeals] || distributions[5];
    const result = {};

    Object.keys(distribution).forEach(meal => {
        result[meal] = Math.round(totalCalories * distribution[meal]);
    });

    return result;
};

/**
 * CÁLCULO COMPLETO
 * Función principal que ejecuta todos los cálculos
 */

export const calculateNutritionalPlan = (patientData, preferences = {}) => {
    const {
        weight,
        height,
        age,
        gender,
        activityLevel = 'Sedentario',
        goal = 'Mantenimiento',
        condition = 'Normal',
        stressFactor = 'Normal',
        formula = 'Mifflin' // Harris-Benedict, Mifflin, FAO, Quick
    } = patientData;

    // 1. Calcular TMB según fórmula seleccionada
    let tmb;
    switch(formula) {
        case 'Harris-Benedict':
            tmb = calculateTMB_HarrisBenedict(weight, height, age, gender);
            break;
        case 'Mifflin':
            tmb = calculateTMB_Mifflin(weight, height, age, gender);
            break;
        case 'FAO':
            tmb = calculateTMB_FAO(weight, height, age, gender);
            break;
        case 'Quick':
            tmb = calculateTMB_Quick(weight, gender);
            break;
        default:
            tmb = calculateTMB_Mifflin(weight, height, age, gender);
    }

    // 2. Calcular GET (con factor de actividad)
    const get = calculateGET(tmb, activityLevel);

    // 3. Aplicar factor de estrés si existe
    const adjustedCalories = applyStressFactor(get, stressFactor);

    // 4. Ajustar según objetivo
    const calorieGoal = adjustForGoal(adjustedCalories, goal);

    // 5. Calcular macronutrientes
    const macros = calculateMacronutrients(calorieGoal.calories, weight, goal, condition);

    // 6. Distribución de comidas
    const mealDistribution = distributeMealCalories(calorieGoal.calories, preferences.numberOfMeals || 5);

    return {
        tmb: Math.round(tmb),
        get: Math.round(get),
        adjustedCalories: Math.round(adjustedCalories),
        calorieGoal,
        macros,
        mealDistribution,
        metadata: {
            formula,
            activityLevel,
            stressFactor,
            goal,
            condition,
            calculationDate: new Date().toISOString()
        }
    };
};

/**
 * VALIDACIÓN DE DATOS
 */

export const validatePatientData = (data) => {
    const errors = [];

    if (!data.weight || data.weight <= 0) {
        errors.push('El peso debe ser mayor a 0');
    }
    if (!data.height || data.height <= 0) {
        errors.push('La talla debe ser mayor a 0');
    }
    if (!data.age || data.age <= 0 || data.age > 120) {
        errors.push('La edad debe estar entre 1 y 120 años');
    }
    if (!data.gender || !['Masculino', 'Femenino'].includes(data.gender)) {
        errors.push('El género debe ser Masculino o Femenino');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * FORMATEO DE RESULTADOS PARA DISPLAY
 */

export const formatResults = (results) => {
    return {
        tmb: `${results.tmb.toLocaleString('es-EC')} kcal`,
        get: `${results.get.toLocaleString('es-EC')} kcal`,
        calories: `${results.calorieGoal.calories.toLocaleString('es-EC')} kcal`,
        calorieRange: `${results.calorieGoal.min.toLocaleString('es-EC')} - ${results.calorieGoal.max.toLocaleString('es-EC')} kcal`,
        protein: `${results.macros.protein.grams}g (${results.macros.protein.percentage}%)`,
        carbs: `${results.macros.carbs.grams}g (${results.macros.carbs.percentage}%)`,
        fats: `${results.macros.fats.grams}g (${results.macros.fats.percentage}%)`
    };
};