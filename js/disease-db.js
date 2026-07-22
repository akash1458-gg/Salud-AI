window.DiseaseDB = [
  {
    id: "influenza",
    keywords: ["flu", "influenza", "fever and chills", "body aches", "seasonal flu"],
    data: {
      urgency: "medium",
      title: "Influenza (The Flu)",
      summary: "A viral infection that attacks your respiratory system, commonly presenting with sudden onset of fever, chills, and body aches.",
      possibleConditions: ["Influenza A or B", "COVID-19", "Common Cold"],
      recommendations: ["Rest and stay hydrated.", "Stay home to prevent spreading the virus."],
      homeRemedies: ["Warm tea with honey", "Humidifier to ease congestion", "Adequate rest"],
      warningSign: "Difficulty breathing, chest pain, or a fever that doesn't go down with medication.",
      followUpQuestion: "Are you experiencing shortness of breath or extreme chest pressure?",
      treatmentProtocol: {
        immediateActions: ["Isolate from others", "Begin taking your temperature every 4 hours"],
        careplan24h: ["Drink at least 8 glasses of water", "Sleep as much as possible"],
        escalationSigns: ["Fever over 103°F (39.4°C)", "Severe shortness of breath", "Blue lips"],
        otcMedications: ["Acetaminophen or Ibuprofen for fever and body aches", "Dextromethorphan for cough"],
        dietaryAdvice: ["Broth-based soups", "Avoid caffeine and alcohol"]
      }
    }
  },
  {
    id: "covid19",
    keywords: ["covid", "covid-19", "coronavirus", "loss of taste", "loss of smell", "dry cough"],
    data: {
      urgency: "medium",
      title: "COVID-19",
      summary: "A highly contagious respiratory illness caused by the SARS-CoV-2 virus, often characterized by cough, fever, and sometimes loss of taste/smell.",
      possibleConditions: ["COVID-19", "Influenza", "Upper Respiratory Infection"],
      recommendations: ["Self-isolate immediately.", "Take a rapid antigen test.", "Monitor oxygen levels if you have a pulse oximeter."],
      homeRemedies: ["Prone positioning (lying on stomach) to help breathing", "Steam inhalation"],
      warningSign: "Oxygen saturation dropping below 92%, severe shortness of breath, or confusion.",
      followUpQuestion: "Have you taken a COVID test or been exposed to someone who tested positive recently?",
      treatmentProtocol: {
        immediateActions: ["Wear a mask around household members", "Open windows for ventilation"],
        careplan24h: ["Monitor oxygen levels twice daily", "Stay continuously hydrated"],
        escalationSigns: ["Inability to stay awake", "Pale, gray, or blue-colored skin, lips, or nail beds"],
        otcMedications: ["Acetaminophen for fever", "Lozenges for sore throat"],
        dietaryAdvice: ["Vitamin C and Zinc rich foods", "Warm broths"]
      }
    }
  },
  {
    id: "appendicitis",
    keywords: ["appendicitis", "sharp stomach pain", "lower right belly pain", "right side stomach pain", "rebound tenderness"],
    data: {
      urgency: "emergency",
      title: "Possible Appendicitis",
      summary: "Inflammation of the appendix, a medical emergency that requires prompt surgical evaluation. Pain typically starts around the belly button and moves to the lower right abdomen.",
      possibleConditions: ["Appendicitis", "Ovarian Torsion (if female)", "Kidney Stones", "Severe Gastroenteritis"],
      recommendations: ["Go to the nearest emergency room immediately.", "Do NOT eat or drink anything in case surgery is needed."],
      homeRemedies: ["None. Do not apply heat to the area as it can cause the appendix to rupture."],
      warningSign: "Sudden pain relief (may indicate rupture) followed by worsening severe pain, high fever, or inability to stand straight.",
      followUpQuestion: "Does the pain worsen severely if you press on your lower right abdomen and quickly release?",
      treatmentProtocol: {
        immediateActions: ["Call a relative or friend to drive you to the ER", "Stop consuming all food and liquids (NPO)"],
        careplan24h: ["Seek emergency medical evaluation immediately"],
        escalationSigns: ["Vomiting uncontrollably", "Fever above 101°F", "Abdomen becomes rigid or hard"],
        otcMedications: ["DO NOT take any pain medications or laxatives, as they can mask symptoms or cause rupture."],
        dietaryAdvice: ["STRICTLY NOTHING BY MOUTH (NPO)."]
      }
    }
  },
  {
    id: "gastroenteritis",
    keywords: ["food poisoning", "stomach bug", "gastroenteritis", "vomiting", "diarrhea", "nausea"],
    data: {
      urgency: "medium",
      title: "Gastroenteritis (Stomach Bug/Food Poisoning)",
      summary: "Intestinal infection marked by diarrhea, cramps, nausea, vomiting, and fever. Usually self-limiting but poses a high risk of dehydration.",
      possibleConditions: ["Viral Gastroenteritis", "Bacterial Food Poisoning", "Norovirus"],
      recommendations: ["Focus entirely on preventing dehydration.", "Rest your stomach."],
      homeRemedies: ["Sip small amounts of water or ice chips", "Ginger tea for nausea"],
      warningSign: "Inability to keep liquids down for 24 hours, blood in vomit or stool, or signs of severe dehydration (no urine).",
      followUpQuestion: "Are you able to keep small sips of water down without vomiting?",
      treatmentProtocol: {
        immediateActions: ["Stop eating solid foods for a few hours", "Sip oral rehydration solutions (Pedialyte or similar)"],
        careplan24h: ["Drink 1-2 ounces of fluid every 15-30 minutes", "Gradually introduce bland foods (BRAT diet)"],
        escalationSigns: ["High fever above 102°F", "Severe, localized abdominal pain", "Extreme dizziness when standing"],
        otcMedications: ["Loperamide (Imodium) for diarrhea (only if no fever/blood)", "Bismuth subsalicylate (Pepto-Bismol)"],
        dietaryAdvice: ["BRAT Diet: Bananas, Rice, Applesauce, Toast", "Avoid dairy, caffeine, alcohol, and fatty foods"]
      }
    }
  },
  {
    id: "migraine",
    keywords: ["migraine", "aura", "throbbing head", "light sensitivity", "sound sensitivity", "pounding headache"],
    data: {
      urgency: "low",
      title: "Migraine Attack",
      summary: "A neurological condition causing intense, throbbing head pain, usually on one side, accompanied by nausea, and sensitivity to light and sound.",
      possibleConditions: ["Migraine with/without aura", "Tension Headache", "Cluster Headache"],
      recommendations: ["Move to a dark, quiet room.", "Sleep if possible to abort the attack."],
      homeRemedies: ["Ice pack on forehead or back of neck", "Caffeine (in early stages)"],
      warningSign: "A headache that feels like 'the worst headache of your life' (thunderclap), which requires immediate ER evaluation.",
      followUpQuestion: "Are you experiencing any visual disturbances like flashing lights or blind spots?",
      treatmentProtocol: {
        immediateActions: ["Take abortive medication at the very first sign of pain", "Eliminate sensory input (lights/noise)"],
        careplan24h: ["Rest for the remainder of the day", "Stay hydrated"],
        escalationSigns: ["New neurological symptoms (weakness, slurred speech)", "Fever or stiff neck"],
        otcMedications: ["Excedrin Migraine (Acetaminophen/Aspirin/Caffeine)", "Ibuprofen 400-600mg", "Prescription Triptans if available"],
        dietaryAdvice: ["Avoid known triggers (chocolate, aged cheese, MSG, red wine)", "Drink plenty of water"]
      }
    }
  },
  {
    id: "uti",
    keywords: ["uti", "urinary tract infection", "burning pee", "frequent urination", "bladder infection", "blood in urine"],
    data: {
      urgency: "medium",
      title: "Urinary Tract Infection (UTI)",
      summary: "An infection in any part of the urinary system, presenting with a strong, persistent urge to urinate and a burning sensation when urinating.",
      possibleConditions: ["Cystitis (Bladder Infection)", "Kidney Infection (if back pain/fever)", "Urethritis"],
      recommendations: ["Consult a doctor for antibiotics.", "Drink plenty of water to flush out bacteria."],
      homeRemedies: ["Drink unsweetened cranberry juice", "Apply a warm heating pad to your lower back/abdomen"],
      warningSign: "Fever, chills, nausea, or flank/back pain, which indicates the infection may have spread to the kidneys.",
      followUpQuestion: "Do you have a fever, or pain in your middle-to-upper back (flank)?",
      treatmentProtocol: {
        immediateActions: ["Start drinking 1-2 glasses of water immediately", "Schedule a telehealth or clinic visit for antibiotics"],
        careplan24h: ["Drink at least 2.5 to 3 liters of water", "Empty bladder frequently"],
        escalationSigns: ["High fever", "Severe back pain", "Vomiting"],
        otcMedications: ["Phenazopyridine (AZO) to relieve burning (Note: turns urine bright orange)", "Ibuprofen for pain"],
        dietaryAdvice: ["Avoid coffee, alcohol, and citrus/spicy foods which can irritate the bladder"]
      }
    }
  },
  {
    id: "heartattack",
    keywords: ["heart attack", "myocardial infarction", "crushing chest pain", "chest pressure", "left arm pain", "jaw pain", "elephant on chest"],
    data: {
      urgency: "emergency",
      title: "Possible Heart Attack (Myocardial Infarction)",
      summary: "A critical medical emergency where blood flow to the heart muscle is blocked. Symptoms include chest pressure, pain radiating to the arm/jaw, shortness of breath, and cold sweat.",
      possibleConditions: ["Heart Attack", "Angina", "Pulmonary Embolism", "Severe Panic Attack"],
      recommendations: ["CALL 911 OR EMERGENCY SERVICES IMMEDIATELY.", "Do not attempt to drive yourself to the hospital."],
      homeRemedies: ["NONE. This is a life-threatening emergency requiring immediate medical intervention."],
      warningSign: "Crushing chest pain radiating to the left arm, neck, or jaw accompanied by shortness of breath.",
      followUpQuestion: "Is the pain spreading to your arm, neck, or jaw, or are you breaking out in a cold sweat?",
      treatmentProtocol: {
        immediateActions: ["Call 911 immediately", "Unlock your front door", "Sit down and try to remain calm"],
        careplan24h: ["Hospital admission and cardiac care"],
        escalationSigns: ["Loss of consciousness", "Cardiac arrest"],
        otcMedications: ["Chew one regular aspirin (325mg) immediately UNLESS you are allergic or advised against it by a doctor.", "If prescribed, take Nitroglycerin."],
        dietaryAdvice: ["Nothing by mouth until evaluated by EMS."]
      }
    }
  },
  {
    id: "stroke",
    keywords: ["stroke", "face drooping", "arm weakness", "slurred speech", "numbness on one side", "FAST", "can't speak"],
    data: {
      urgency: "emergency",
      title: "Possible Stroke",
      summary: "A medical emergency caused by interrupted blood flow to the brain (ischemic) or bleeding in the brain (hemorrhagic). Every minute counts to save brain tissue.",
      possibleConditions: ["Stroke (Ischemic or Hemorrhagic)", "Transient Ischemic Attack (TIA / Mini-stroke)", "Bell's Palsy"],
      recommendations: ["CALL 911 IMMEDIATELY. Time is brain.", "Note the exact time symptoms started."],
      homeRemedies: ["NONE. This requires immediate emergency medical treatment."],
      warningSign: "Remember FAST: Face drooping, Arm weakness, Speech difficulty, Time to call 911.",
      followUpQuestion: "Are you able to raise both arms equally and smile without one side of your face drooping?",
      treatmentProtocol: {
        immediateActions: ["Call 911 immediately", "Note the exact time symptoms began (crucial for treatment options)", "Do not go to sleep"],
        careplan24h: ["Hospitalization in a stroke unit"],
        escalationSigns: ["Loss of consciousness", "Seizure", "Breathing stopping"],
        otcMedications: ["DO NOT take aspirin. If it is a bleeding (hemorrhagic) stroke, aspirin will make it worse."],
        dietaryAdvice: ["STRICTLY NOTHING BY MOUTH. Stroke patients often lose the ability to swallow safely (dysphagia)."]
      }
    }
  },
  {
    id: "diabetes_hyperglycemia",
    keywords: ["diabetes", "high blood sugar", "hyperglycemia", "extreme thirst", "frequent urination", "fruity breath"],
    data: {
      urgency: "high",
      title: "Hyperglycemia / Poorly Controlled Diabetes",
      summary: "Abnormally high blood sugar levels. If very high, it can lead to dangerous conditions like Diabetic Ketoacidosis (DKA) or Hyperosmolar Hyperglycemic State (HHS).",
      possibleConditions: ["Hyperglycemia", "Diabetic Ketoacidosis (DKA)", "New Onset Diabetes"],
      recommendations: ["Check your blood sugar immediately.", "Drink plenty of water to help flush sugar through urine."],
      homeRemedies: ["Hydration with plain water", "Light exercise (ONLY if blood sugar is under 250 mg/dL and no ketones are present)"],
      warningSign: "Fruity-smelling breath, confusion, nausea/vomiting, or extreme shortness of breath (signs of DKA).",
      followUpQuestion: "What is your current blood sugar reading, and do you have any nausea or fruity-smelling breath?",
      treatmentProtocol: {
        immediateActions: ["Test blood sugar", "Check urine for ketones if blood sugar is > 240 mg/dL", "Take insulin as prescribed by your sliding scale"],
        careplan24h: ["Drink 1 large glass of water every hour", "Monitor blood sugar every 2-4 hours"],
        escalationSigns: ["Blood sugar over 300 mg/dL that won't come down", "Moderate/high ketones", "Vomiting or confusion (Go to ER)"],
        otcMedications: ["Avoid sugary syrups. Continue prescribed diabetes medications unless instructed otherwise."],
        dietaryAdvice: ["Avoid all carbohydrates and sugars until levels stabilize", "Drink only water or zero-calorie fluids"]
      }
    }
  },
  {
    id: "diabetes_hypoglycemia",
    keywords: ["low blood sugar", "hypoglycemia", "shaky", "sweating", "dizzy and hungry", "sugar crash"],
    data: {
      urgency: "high",
      title: "Hypoglycemia (Low Blood Sugar)",
      summary: "Blood sugar dropping below 70 mg/dL. This requires immediate treatment to bring levels back to a safe range.",
      possibleConditions: ["Hypoglycemia (Insulin Reaction)", "Reactive Hypoglycemia", "Malnutrition"],
      recommendations: ["Consume 15 grams of fast-acting carbohydrates immediately.", "Check blood sugar 15 minutes after treating."],
      homeRemedies: ["The 15-15 Rule: 15g of carbs, wait 15 minutes, check again."],
      warningSign: "Confusion, inability to swallow, seizures, or loss of consciousness.",
      followUpQuestion: "Are you able to safely swallow juice or chew glucose tablets right now?",
      treatmentProtocol: {
        immediateActions: ["Eat or drink 15 grams of fast-acting carbs (e.g., 4oz juice, 4 glucose tabs, 1 tbsp honey)", "Sit down to avoid falling"],
        careplan24h: ["Once blood sugar is > 70 mg/dL, eat a snack with complex carbs and protein (e.g., half a sandwich)", "Monitor closely"],
        escalationSigns: ["Loss of consciousness (Requires Glucagon injection or 911)", "Seizures"],
        otcMedications: ["Glucose tablets or gels. DO NOT give insulin."],
        dietaryAdvice: ["Fast-acting carbs first (juice/soda/candy). Avoid chocolate or fat-heavy sweets initially as fat slows sugar absorption."]
      }
    }
  },
  {
    id: "asthma",
    keywords: ["asthma", "wheezing", "tight chest", "asthma attack", "difficulty breathing", "shortness of breath"],
    data: {
      urgency: "high",
      title: "Asthma Exacerbation (Asthma Attack)",
      summary: "Airways become inflamed, narrow and swell, and produce extra mucus, making it difficult to breathe.",
      possibleConditions: ["Asthma Attack", "Allergic Reaction", "Bronchitis", "COPD Exacerbation"],
      recommendations: ["Use your rescue inhaler (Albuterol) immediately.", "Sit upright to open airways."],
      homeRemedies: ["Pursed-lip breathing", "Stay calm to prevent hyperventilation", "Move away from triggers (smoke, dust, pets)"],
      warningSign: "Inhaler is not helping, severe shortness of breath, inability to speak in full sentences, or blue tint to lips/fingers.",
      followUpQuestion: "Have you used your rescue inhaler, and if so, did it provide any relief?",
      treatmentProtocol: {
        immediateActions: ["Take 2-6 puffs of Albuterol rescue inhaler", "Sit upright, do not lie down", "Loosen tight clothing"],
        careplan24h: ["Monitor peak flow if you have a meter", "Take controller medications as prescribed", "Rest"],
        escalationSigns: ["Chest retractions (skin sucking in around ribs)", "Difficulty walking or talking", "Lips or fingernails turning blue (Call 911)"],
        otcMedications: ["Avoid NSAIDs if they are a known trigger for your asthma."],
        dietaryAdvice: ["Drink warm fluids to help loosen mucus."]
      }
    }
  },
  {
    id: "pinkeye",
    keywords: ["pink eye", "conjunctivitis", "red eye", "crusty eye", "itchy eye", "eye discharge"],
    data: {
      urgency: "low",
      title: "Conjunctivitis (Pink Eye)",
      summary: "Inflammation or infection of the transparent membrane that lines your eyelid and covers the white part of your eyeball.",
      possibleConditions: ["Viral Conjunctivitis", "Bacterial Conjunctivitis", "Allergic Conjunctivitis"],
      recommendations: ["Wash your hands frequently and do not touch your eyes.", "Use a clean, warm compress."],
      homeRemedies: ["Warm or cold compress (use different cloths for each eye)", "Artificial tears to soothe irritation"],
      warningSign: "Severe eye pain, extreme sensitivity to light, blurred vision that doesn't clear with blinking.",
      followUpQuestion: "Are you experiencing severe pain in the eye or any changes to your vision?",
      treatmentProtocol: {
        immediateActions: ["Remove contact lenses immediately and do not wear them until cleared", "Wash hands thoroughly with soap"],
        careplan24h: ["Apply a compress for 10-15 mins a few times a day", "Wash pillowcases and towels in hot water"],
        escalationSigns: ["Vision loss", "Intense eye pain", "Thick greenish/yellow pus that immediately returns after wiping"],
        otcMedications: ["Artificial tears (lubricating eye drops)", "Antihistamine eye drops (if allergic)", "Avoid 'redness relief' drops as they can cause rebound redness"],
        dietaryAdvice: ["No specific dietary restrictions."]
      }
    }
  }
];
