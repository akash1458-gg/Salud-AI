(function () {
    let apiKey = localStorage.getItem('healthPulse_apiKey') || '';
    let demoMode = localStorage.getItem('healthPulse_demoMode') === 'true';
    let conversationHistory = [];
    let lastOfflineResult = null;

    const delay = () => new Promise(res => setTimeout(res, Math.floor(Math.random() * 400) + 1200));

    // --- MASSIVE OFFLINE CLINICAL DECISION KNOWLEDGE BASE ---
    // Structured by region, then by severity threshold (severe >= 4, mild < 4)
    const clinicalDB = {
        head: {
            severe: {
                urgency: 'emergency',
                title: 'Severe Head Pain / Possible Neurological Event',
                summary: 'High severity symptoms in the head area indicate potential acute conditions like a severe migraine, cluster headache, or possibly a stroke or aneurysm depending on other signs.',
                possibleConditions: ['Severe Migraine', 'Cluster Headache', 'Stroke (if accompanied by neurological signs)', 'Meningitis (if stiff neck)'],
                recommendations: ['Seek emergency medical attention immediately if you experience sudden, severe "thunderclap" headache, vision changes, or numbness.', 'Rest in a dark, quiet room.', 'Avoid driving.'],
                homeRemedies: ['Cold compress on forehead', 'Hydration', 'Rest in a dark room'],
                warningSign: 'Sudden onset of maximum severity pain, confusion, fainting, or one-sided weakness.',
                followUpQuestion: 'Are you experiencing any changes in vision, speech difficulty, or weakness on one side of your body?',
                treatmentProtocol: {
                    immediateActions: ['Stop all physical activity', 'Have someone stay with you', 'Call emergency services if symptoms are sudden and severe'],
                    careplan24h: ['Monitor for neurological changes', 'Keep a symptom journal', 'Avoid bright lights and loud noises'],
                    escalationSigns: ['Loss of consciousness', 'Inability to speak clearly', 'Vomiting without nausea'],
                    otcMedications: ['Avoid taking pain medication until evaluated by a doctor, in case of bleeding.'],
                    dietaryAdvice: ['Stay hydrated with clear fluids', 'Avoid caffeine and alcohol', 'Avoid tyramine-rich foods (aged cheeses, cured meats)']
                }
            },
            mild: {
                urgency: 'low',
                title: 'Tension Headache / Mild Migraine',
                summary: 'Mild to moderate head pain often relates to stress, dehydration, or tension.',
                possibleConditions: ['Tension Headache', 'Dehydration', 'Sinus Headache', 'Mild Migraine'],
                recommendations: ['Rest and hydrate.', 'Try stress-reduction techniques.', 'Maintain regular sleep patterns.'],
                homeRemedies: ['Warm or cold compress', 'Gentle neck massage', 'Peppermint oil on temples'],
                warningSign: 'Pain worsening significantly over time or not responding to OTC pain relievers.',
                followUpQuestion: 'Are you experiencing any nasal congestion or pressure around your eyes?',
                treatmentProtocol: {
                    immediateActions: ['Drink 500ml of water', 'Take a 15-minute break in a quiet space'],
                    careplan24h: ['Ensure 8 hours of sleep', 'Use a humidifier if sinus issues suspected', 'Monitor screen time'],
                    escalationSigns: ['Fever over 101°F', 'Development of stiff neck', 'Pain spreading to jaw'],
                    otcMedications: ['Ibuprofen 400mg every 6-8 hours with food (max 1200mg/day)', 'Acetaminophen 500mg every 4-6 hours (max 3000mg/day)'],
                    dietaryAdvice: ['Drink at least 2 liters of water daily', 'Eat regular, balanced meals to stabilize blood sugar', 'Avoid artificial sweeteners']
                }
            }
        },
        face: {
            severe: {
                urgency: 'emergency',
                title: 'Severe Facial Pain / Asymmetry',
                summary: 'Severe facial symptoms could indicate conditions ranging from trigeminal neuralgia to Bell\'s palsy or stroke.',
                possibleConditions: ['Trigeminal Neuralgia', 'Stroke', 'Bell\'s Palsy', 'Severe Dental Infection'],
                recommendations: ['Seek immediate medical evaluation if facial drooping or sudden weakness occurs.', 'Do not ignore severe, shooting facial pain.'],
                homeRemedies: ['Avoid triggering actions like chewing on the affected side', 'Keep face warm if cold triggers pain'],
                warningSign: 'Inability to close one eye, facial drooping, or slurred speech.',
                followUpQuestion: 'Can you smile evenly and raise both eyebrows?',
                treatmentProtocol: {
                    immediateActions: ['Check for FAST (Face drooping, Arm weakness, Speech difficulty, Time to call 911)'],
                    careplan24h: ['Seek urgent care evaluation', 'Protect the eye on the affected side if unable to blink'],
                    escalationSigns: ['Breathing difficulty', 'Difficulty swallowing', 'Fever with swelling'],
                    otcMedications: ['OTC pain relievers may be ineffective for nerve pain; seek medical advice.'],
                    dietaryAdvice: ['Eat soft foods to avoid chewing strain', 'Avoid extremely hot or cold foods']
                }
            },
            mild: {
                urgency: 'low',
                title: 'Mild Facial Discomfort / Sinus Pressure',
                summary: 'Mild facial symptoms are commonly related to sinus congestion, TMJ (jaw tension), or mild dental issues.',
                possibleConditions: ['Sinusitis', 'TMJ Disorder', 'Mild Dental Caries', 'Allergies'],
                recommendations: ['Use a warm compress over sinuses or jaw.', 'Consider a saline nasal spray for sinus pressure.'],
                homeRemedies: ['Steam inhalation', 'Warm compress', 'Facial massage'],
                warningSign: 'Swelling of the jaw or cheek, or fever accompanying pain.',
                followUpQuestion: 'Does the pain worsen when you bend forward or chew?',
                treatmentProtocol: {
                    immediateActions: ['Apply warm compress for 15 minutes', 'Use saline nasal drops if congested'],
                    careplan24h: ['Practice jaw relaxation exercises', 'Sleep with head elevated'],
                    escalationSigns: ['Visible swelling', 'Pus or foul taste in mouth', 'Fever'],
                    otcMedications: ['Ibuprofen 400mg every 6-8 hours for inflammation', 'OTC decongestants (e.g., Pseudoephedrine) if sinus related, as directed'],
                    dietaryAdvice: ['Stay hydrated to thin mucus', 'Avoid hard or chewy foods if jaw hurts', 'Drink warm herbal teas']
                }
            }
        },
        neck: {
            severe: {
                urgency: 'emergency',
                title: 'Severe Neck Pain / Rigidity',
                summary: 'Severe neck pain, especially with stiffness (inability to touch chin to chest), can be a medical emergency.',
                possibleConditions: ['Meningitis', 'Cervical Spine Injury', 'Herniated Disc'],
                recommendations: ['Go to the emergency room if you cannot bend your neck forward or have a high fever.', 'Immobilize the neck if trauma occurred.'],
                homeRemedies: ['None recommended until medically evaluated.'],
                warningSign: 'Inability to touch chin to chest, high fever, or numbness radiating down arms.',
                followUpQuestion: 'Have you had any recent trauma, or do you currently have a high fever?',
                treatmentProtocol: {
                    immediateActions: ['Avoid moving the neck unnecessarily', 'Have someone drive you to the ER or call ambulance'],
                    careplan24h: ['Follow ER discharge instructions strictly', 'Do not attempt chiropractic adjustments'],
                    escalationSigns: ['Loss of bowel/bladder control', 'Weakness in arms or legs', 'Confusion'],
                    otcMedications: ['Do not take medication that masks symptoms before evaluation.'],
                    dietaryAdvice: ['No specific restrictions, but remain fasting if surgery is a possibility.']
                }
            },
            mild: {
                urgency: 'low',
                title: 'Neck Strain / Muscle Tension',
                summary: 'Mild neck pain is often due to poor posture, sleeping awkwardly, or minor muscle strain.',
                possibleConditions: ['Muscle Strain (Torticollis)', 'Poor Ergonomics', 'Mild Cervical Spondylosis'],
                recommendations: ['Improve posture and workspace ergonomics.', 'Use gentle stretching.', 'Apply heat or cold.'],
                homeRemedies: ['Alternating hot and cold packs', 'Gentle neck rolls', 'Epsom salt bath'],
                warningSign: 'Pain radiating down the arm, tingling in fingers, or persisting over a week.',
                followUpQuestion: 'Do you spend long hours looking down at a phone or computer screen?',
                treatmentProtocol: {
                    immediateActions: ['Apply ice pack for 15 mins for first 24h, then switch to heat', 'Adjust computer monitor to eye level'],
                    careplan24h: ['Do gentle range-of-motion exercises', 'Sleep with a supportive cervical pillow'],
                    escalationSigns: ['Numbness or tingling in arms/hands', 'Weakness in grip strength', 'Pain waking you at night'],
                    otcMedications: ['Naproxen 220mg every 12 hours (with food)', 'Topical analgesics (e.g., Menthol/Camphor creams) applied locally'],
                    dietaryAdvice: ['Incorporate anti-inflammatory foods like turmeric and omega-3s', 'Stay hydrated to keep intervertebral discs healthy']
                }
            }
        },
        chest: {
            severe: {
                urgency: 'emergency',
                title: 'Severe Chest Pain / Pressure',
                summary: 'Severe chest pain, pressure, or tightness is a life-threatening emergency until proven otherwise.',
                possibleConditions: ['Myocardial Infarction (Heart Attack)', 'Pulmonary Embolism', 'Aortic Dissection'],
                recommendations: ['CALL EMERGENCY SERVICES IMMEDIATELY (e.g., 911).', 'Do not drive yourself to the hospital.', 'Chew aspirin if advised by emergency dispatcher.'],
                homeRemedies: ['None. Seek immediate emergency care.'],
                warningSign: 'Crushing pain, pain radiating to left arm or jaw, shortness of breath, sweating.',
                followUpQuestion: 'Are you experiencing any shortness of breath, sweating, or nausea along with the chest pain?',
                treatmentProtocol: {
                    immediateActions: ['Call 911 immediately', 'Unlock your front door', 'Sit down and rest'],
                    careplan24h: ['Hospitalization and acute cardiac care protocol'],
                    escalationSigns: ['Loss of consciousness', 'Severe difficulty breathing'],
                    otcMedications: ['Aspirin 325mg (chewed) ONLY if instructed by emergency personnel and no contraindications exist.'],
                    dietaryAdvice: ['Do not eat or drink anything until cleared by medical professionals.']
                }
            },
            mild: {
                urgency: 'medium',
                title: 'Mild Chest Discomfort',
                summary: 'Mild chest discomfort can be caused by acid reflux, muscle strain, or anxiety, but should still be monitored closely.',
                possibleConditions: ['GERD / Acid Reflux', 'Costochondritis', 'Muscle Strain', 'Anxiety / Panic Attack'],
                recommendations: ['Monitor symptoms closely. If they worsen, seek immediate care.', 'Try an antacid if you suspect acid reflux.', 'Rest and practice deep breathing.'],
                homeRemedies: ['Sip warm water', 'Elevate head while lying down', 'Deep, slow breathing exercises'],
                warningSign: 'Pain that worsens with physical exertion or becomes heavy/crushing.',
                followUpQuestion: 'Does the pain change when you take a deep breath or press on your chest?',
                treatmentProtocol: {
                    immediateActions: ['Stop strenuous activity', 'Take an antacid if you suspect heartburn', 'Sit upright'],
                    careplan24h: ['Monitor for any changes in intensity or character of pain', 'Avoid heavy lifting'],
                    escalationSigns: ['Pain becoming severe', 'Shortness of breath', 'Dizziness or sweating'],
                    otcMedications: ['Calcium carbonate (Tums) 500-1000mg as needed for reflux', 'Ibuprofen 400mg every 6-8 hours if pain is musculoskeletal (worsens when pressing chest)'],
                    dietaryAdvice: ['Avoid spicy, fatty, or highly acidic foods', 'Avoid large meals before bedtime', 'Limit caffeine']
                }
            }
        },
        upperAbdomen: {
            severe: {
                urgency: 'high',
                title: 'Severe Upper Abdominal Pain',
                summary: 'Severe pain in the upper abdomen can indicate serious acute issues involving the gallbladder, pancreas, or stomach.',
                possibleConditions: ['Gallbladder Attack (Cholecystitis)', 'Acute Pancreatitis', 'Perforated Ulcer'],
                recommendations: ['Seek emergency medical care, especially if accompanied by fever, jaundice, or severe vomiting.', 'Do not eat or drink anything.'],
                homeRemedies: ['None. Requires medical evaluation.'],
                warningSign: 'Vomiting blood or material that looks like coffee grounds, high fever, or yellowing of skin/eyes.',
                followUpQuestion: 'Does the pain radiate to your back or right shoulder blade?',
                treatmentProtocol: {
                    immediateActions: ['Go to the nearest emergency department', 'Do not consume food or water'],
                    careplan24h: ['Medical imaging and possible surgical/medical intervention as directed by physicians'],
                    escalationSigns: ['Fainting', 'Hard, board-like abdomen', 'High fever'],
                    otcMedications: ['Avoid all NSAIDs (ibuprofen, naproxen, aspirin) as they can worsen ulcers.'],
                    dietaryAdvice: ['Strictly nil per os (NPO - nothing by mouth) until evaluated.']
                }
            },
            mild: {
                urgency: 'low',
                title: 'Indigestion / Gastritis',
                summary: 'Mild upper abdominal pain is often related to diet, indigestion, or mild gastritis.',
                possibleConditions: ['Dyspepsia (Indigestion)', 'Mild Gastritis', 'Peptic Ulcer Disease'],
                recommendations: ['Eat smaller, frequent meals.', 'Avoid spicy, greasy, or highly processed foods.', 'Consider an OTC antacid.'],
                homeRemedies: ['Ginger tea', 'Chamomile tea', 'Heating pad on low setting'],
                warningSign: 'Pain that wakes you from sleep, unexpected weight loss, or difficulty swallowing.',
                followUpQuestion: 'Does eating food make the pain better or worse?',
                treatmentProtocol: {
                    immediateActions: ['Sip water or non-caffeinated herbal tea', 'Loosen tight clothing'],
                    careplan24h: ['Eat a bland diet (BRAT: Bananas, Rice, Applesauce, Toast)', 'Avoid lying flat within 2 hours of eating'],
                    escalationSigns: ['Persistent vomiting', 'Dark, tarry stools', 'Increasing pain intensity'],
                    otcMedications: ['Famotidine (Pepcid) 20mg once or twice daily', 'Bismuth subsalicylate (Pepto-Bismol) as directed on package'],
                    dietaryAdvice: ['Avoid alcohol, caffeine, and NSAIDs', 'Eat bland, easily digestible foods', 'Incorporate probiotic-rich foods']
                }
            }
        },
        lowerAbdomen: {
            severe: {
                urgency: 'emergency',
                title: 'Severe Lower Abdominal Pain',
                summary: 'Severe pain in the lower abdomen can indicate life-threatening conditions like appendicitis, ectopic pregnancy, or bowel obstruction.',
                possibleConditions: ['Appendicitis', 'Ectopic Pregnancy (in females of childbearing age)', 'Kidney Stones', 'Diverticulitis'],
                recommendations: ['Go to the emergency room immediately.', 'Do not take pain medication or eat/drink until evaluated.'],
                homeRemedies: ['None.'],
                warningSign: 'Pain that starts around the navel and moves to the lower right, fever, or inability to pass gas.',
                followUpQuestion: 'Are you experiencing fever, vomiting, or pain during urination?',
                treatmentProtocol: {
                    immediateActions: ['Seek emergency transport or have someone drive you to the ER', 'Remain fasting'],
                    careplan24h: ['Follow urgent medical care directives, which may involve surgery or IV antibiotics'],
                    escalationSigns: ['Sudden relief of pain followed by worsening widespread pain (possible rupture)', 'Dizziness/fainting'],
                    otcMedications: ['Avoid laxatives or enemas', 'Avoid pain medications which can mask signs of appendicitis'],
                    dietaryAdvice: ['NPO (Nothing by mouth).']
                }
            },
            mild: {
                urgency: 'low',
                title: 'Mild Lower Abdominal Cramping',
                summary: 'Mild lower abdominal discomfort is often related to bowel habits, menstrual cycles, or mild dietary indiscretion.',
                possibleConditions: ['Constipation', 'Menstrual Cramps (Dysmenorrhea)', 'Irritable Bowel Syndrome (IBS)', 'Mild Urinary Tract Infection (UTI)'],
                recommendations: ['Increase water and fiber intake.', 'Use a heating pad for cramps.', 'Monitor urinary symptoms.'],
                homeRemedies: ['Warm bath', 'Heating pad applied to lower abdomen', 'Peppermint or ginger tea'],
                warningSign: 'Blood in urine or stool, fever, or pain that steadily increases over hours.',
                followUpQuestion: 'Do you have any burning sensation when urinating, or changes in your bowel habits?',
                treatmentProtocol: {
                    immediateActions: ['Drink 1-2 glasses of water', 'Take a short, gentle walk to stimulate digestion'],
                    careplan24h: ['Apply heat for 20 minutes at a time', 'Monitor bowel movements and urination'],
                    escalationSigns: ['Fever', 'Severe localized pain', 'Inability to urinate'],
                    otcMedications: ['Ibuprofen 400mg every 6-8 hours (highly effective for menstrual cramps)', 'Senna or Polyethylene Glycol (Miralax) if constipated (as directed)'],
                    dietaryAdvice: ['Increase soluble fiber (oats, fruits)', 'Drink plenty of water', 'Avoid excessively gassy foods (beans, cabbage)']
                }
            }
        },
        // Extremities mapped generically to arms/legs
        arm_shoulder: {
            severe: {
                urgency: 'high',
                title: 'Severe Upper Extremity Pain / Trauma',
                summary: 'Severe pain in the arm or shoulder can result from fractures, dislocations, or sometimes referred pain from the heart (especially left arm).',
                possibleConditions: ['Fracture', 'Joint Dislocation', 'Rotator Cuff Tear', 'Myocardial Infarction (if left arm + chest pain)'],
                recommendations: ['Immobilize the limb.', 'Go to urgent care or the emergency room, especially if there is deformity or numbness.', 'If left arm pain occurs with chest tightness, call 911.'],
                homeRemedies: ['Immobilization using a makeshift sling', 'Ice pack wrapped in a towel'],
                warningSign: 'Obvious physical deformity, loss of pulse in the wrist, or cold/pale fingers.',
                followUpQuestion: 'Was there a specific injury, fall, or trauma that caused this pain?',
                treatmentProtocol: {
                    immediateActions: ['Remove rings or jewelry from the affected arm/hand immediately', 'Immobilize in the position found'],
                    careplan24h: ['Seek X-ray and medical evaluation', 'Keep elevated above heart level if possible'],
                    escalationSigns: ['Fingers turning blue or pale', 'Severe swelling', 'Increasing numbness'],
                    otcMedications: ['Acetaminophen 500mg-1000mg for pain control on the way to the doctor (do not exceed 3000mg/day)'],
                    dietaryAdvice: ['No specific restrictions, standard healthy diet.']
                }
            },
            mild: {
                urgency: 'low',
                title: 'Muscle Strain / Tendinitis in Upper Extremity',
                summary: 'Mild pain in the arms or shoulders is typically due to overuse, minor sprains, or tendinitis.',
                possibleConditions: ['Muscle Strain', 'Biceps Tendinitis', 'Tennis Elbow', 'Mild Bursitis'],
                recommendations: ['Follow the RICE protocol (Rest, Ice, Compression, Elevation).', 'Avoid heavy lifting or repetitive motions.'],
                homeRemedies: ['Ice pack for 15-20 mins', 'Gentle stretching after acute pain subsides', 'Epsom salt soak'],
                warningSign: 'Inability to lift the arm, sharp catching pain in the joint, or worsening swelling.',
                followUpQuestion: 'Does the pain worsen with specific movements or lifting objects?',
                treatmentProtocol: {
                    immediateActions: ['Stop the activity that caused the pain', 'Apply ice wrapped in a thin towel'],
                    careplan24h: ['Rest the affected limb', 'Apply compression bandage lightly if swollen'],
                    escalationSigns: ['Redness or warmth over the joint (possible infection)', 'Pain preventing sleep'],
                    otcMedications: ['Ibuprofen 400mg every 6-8 hours with food', 'Diclofenac topical gel (Voltaren) applied to joint 4 times daily'],
                    dietaryAdvice: ['Consume adequate protein for muscle repair', 'Anti-inflammatory foods (berries, fatty fish, turmeric)']
                }
            }
        },
        leg_knee_thigh: {
            severe: {
                urgency: 'high',
                title: 'Severe Lower Extremity Pain / Swelling',
                summary: 'Severe pain, sudden swelling, or inability to bear weight requires prompt evaluation to rule out clots, fractures, or ligament tears.',
                possibleConditions: ['Deep Vein Thrombosis (DVT - blood clot)', 'Fracture', 'Cruciate Ligament Tear', 'Severe Sciatica'],
                recommendations: ['Do not bear weight on the affected leg.', 'If you have sudden swelling, redness, and warmth in the calf, go to the ER immediately (DVT risk).'],
                homeRemedies: ['Elevation', 'Do not massage the calf if a clot is suspected.'],
                warningSign: 'Sudden swelling in one leg, localized warmth, or chest pain/shortness of breath (signs of pulmonary embolism).',
                followUpQuestion: 'Is one leg significantly more swollen, red, or warm than the other?',
                treatmentProtocol: {
                    immediateActions: ['Sit or lie down', 'Elevate the leg safely', 'Do NOT massage the leg'],
                    careplan24h: ['Seek urgent medical imaging (Ultrasound or X-ray)'],
                    escalationSigns: ['Chest pain', 'Shortness of breath', 'Cold, pale foot'],
                    otcMedications: ['Avoid NSAIDs until evaluated if surgery might be needed.'],
                    dietaryAdvice: ['Stay hydrated.']
                }
            },
            mild: {
                urgency: 'low',
                title: 'Minor Strain / Overuse Injury in Leg',
                summary: 'Mild leg or knee pain is often related to muscle fatigue, minor sprains, or mild osteoarthritis.',
                possibleConditions: ['Muscle Cramp (Charley Horse)', 'Patellofemoral Pain Syndrome', 'Mild Hamstring Strain', 'Osteoarthritis'],
                recommendations: ['Rest the leg and elevate it when sitting.', 'Apply ice to acute injuries or heat for chronic muscle stiffness.', 'Stretch gently.'],
                homeRemedies: ['Gentle stretching of calves and hamstrings', 'Warm bath', 'Massage (if no clot risk)'],
                warningSign: 'Knee giving way, locking, or swelling significantly after activity.',
                followUpQuestion: 'Does the pain improve with rest, and does your knee feel stable when walking?',
                treatmentProtocol: {
                    immediateActions: ['R.I.C.E. (Rest, Ice, Compression, Elevation)', 'Use supportive footwear'],
                    careplan24h: ['Avoid high-impact activities like running or jumping', 'Perform gentle mobility exercises'],
                    escalationSigns: ['Inability to bear any weight', 'Joint popping followed by swelling', 'Fever'],
                    otcMedications: ['Naproxen 220mg every 12 hours with food', 'Acetaminophen 500mg every 6 hours'],
                    dietaryAdvice: ['Ensure adequate intake of potassium and magnesium (bananas, spinach, nuts) to prevent cramping', 'Hydration']
                }
            }
        },
        hands_feet: {
            severe: {
                urgency: 'medium',
                title: 'Severe Hand/Foot Pain or Injury',
                summary: 'Severe pain in the extremities can be due to acute gout, fractures, or severe infections.',
                possibleConditions: ['Acute Gout Attack', 'Fracture', 'Cellulitis (Infection)'],
                recommendations: ['Immobilize and elevate the affected hand or foot.', 'Seek medical attention for X-rays or infection management.'],
                homeRemedies: ['Elevation above the heart', 'Do not wear tight shoes or rings'],
                warningSign: 'Red streaks spreading up the arm or leg, extreme pain at rest, or exposed bone.',
                followUpQuestion: 'Is the joint red, hot to the touch, and exquisitely painful even to light pressure?',
                treatmentProtocol: {
                    immediateActions: ['Remove rings immediately (if hand injured) before swelling worsens', 'Keep weight off the foot'],
                    careplan24h: ['Seek urgent care', 'Keep the limb elevated continuously'],
                    escalationSigns: ['Redness spreading rapidly', 'Fever', 'Loss of sensation in toes/fingers'],
                    otcMedications: ['Ibuprofen 400-600mg every 6-8 hours (highly effective for gout inflammation if cleared by doctor)'],
                    dietaryAdvice: ['If gout suspected: STRICTLY avoid alcohol, shellfish, organ meats, and high-fructose corn syrup', 'Drink copious amounts of water (3+ liters)']
                }
            },
            mild: {
                urgency: 'low',
                title: 'Mild Hand/Foot Discomfort',
                summary: 'Mild pain is often due to minor sprains, plantar fasciitis, or repetitive strain (e.g., carpal tunnel).',
                possibleConditions: ['Plantar Fasciitis', 'Carpal Tunnel Syndrome', 'Mild Sprain', 'Osteoarthritis'],
                recommendations: ['Wear supportive footwear or use an ergonomic keyboard setup.', 'Rest and perform gentle stretching.', 'Use ice after activity.'],
                homeRemedies: ['Rolling a frozen water bottle under the foot', 'Wrist splints at night', 'Contrast baths (warm/cold)'],
                warningSign: 'Numbness that becomes constant, or weakness dropping objects.',
                followUpQuestion: 'Are you experiencing any numbness or tingling in your fingers or toes?',
                treatmentProtocol: {
                    immediateActions: ['Take breaks from typing or standing', 'Apply ice packs to sore arches or wrists for 15 mins'],
                    careplan24h: ['Wear supportive shoes (no bare feet)', 'Use a wrist splint while sleeping if suspecting carpal tunnel'],
                    escalationSigns: ['Severe sharp pain when stepping', 'Constant numbness', 'Wounds on feet that won\'t heal'],
                    otcMedications: ['Ibuprofen 400mg every 6-8 hours with food', 'Topical analgesics'],
                    dietaryAdvice: ['Maintain healthy weight to reduce load on feet', 'Anti-inflammatory diet']
                }
            }
        },
        default: {
             severe: {
                urgency: 'high',
                title: 'Severe Unspecified Symptoms',
                summary: 'Severe symptoms require prompt medical evaluation to ensure accurate diagnosis and safety.',
                possibleConditions: ['Systemic Infection', 'Acute Inflammation', 'Undiagnosed Condition'],
                recommendations: ['Seek immediate medical evaluation.', 'Do not ignore severe or worsening symptoms.'],
                homeRemedies: ['Rest, hydration, and safe positioning'],
                warningSign: 'Fever above 103°F (39.4°C), difficulty breathing, confusion, or severe unrelenting pain.',
                followUpQuestion: 'Have your symptoms worsened rapidly in the last few hours?',
                treatmentProtocol: {
                    immediateActions: ['Have someone assist you', 'Prepare to visit an urgent care or ER'],
                    careplan24h: ['Monitor vital signs closely', 'Keep a record of all symptoms'],
                    escalationSigns: ['Loss of consciousness', 'Breathing distress', 'Extreme lethargy'],
                    otcMedications: ['Consult a pharmacist or doctor before taking new medications.'],
                    dietaryAdvice: ['Maintain hydration with water or electrolyte solutions.']
                }
            },
            mild: {
                urgency: 'low',
                title: 'Mild Unspecified Symptoms',
                summary: 'Mild generalized symptoms are often self-limiting and respond well to rest and basic home care.',
                possibleConditions: ['Viral Infection', 'Fatigue', 'Mild Dehydration', 'Stress'],
                recommendations: ['Prioritize rest and hydration.', 'Monitor your symptoms over the next 24-48 hours.', 'Maintain a healthy diet.'],
                homeRemedies: ['Adequate sleep', 'Warm herbal teas', 'Stress reduction techniques'],
                warningSign: 'Symptoms lasting longer than a week or steadily worsening over time.',
                followUpQuestion: 'Have you been exposed to anyone who has been sick recently?',
                treatmentProtocol: {
                    immediateActions: ['Rest and drink a glass of water', 'Take a break from strenuous activities'],
                    careplan24h: ['Aim for 8 hours of sleep', 'Monitor temperature for fever'],
                    escalationSigns: ['Fever over 101°F', 'Inability to keep fluids down', 'Pain localizing to a specific area'],
                    otcMedications: ['Acetaminophen 500mg every 4-6 hours for general aches/fever'],
                    dietaryAdvice: ['Eat a balanced diet rich in vitamins and minerals', 'Drink plenty of water']
                }
            }
        }
    };

    function mapRegionToCategory(regionStr) {
        const reg = regionStr.toLowerCase();
        if (reg.includes('head')) return 'head';
        if (reg.includes('face') || reg.includes('jaw') || reg.includes('eye')) return 'face';
        if (reg.includes('neck')) return 'neck';
        if (reg.includes('chest') || reg.includes('breast') || reg.includes('heart')) return 'chest';
        if (reg.includes('upperabdomen') || reg.includes('stomach') || reg.includes('belly')) return 'upperAbdomen';
        if (reg.includes('lowerabdomen') || reg.includes('pelvis') || reg.includes('groin')) return 'lowerAbdomen';
        if (reg.includes('shoulder') || reg.includes('arm')) return 'arm_shoulder';
        if (reg.includes('leg') || reg.includes('thigh') || reg.includes('knee') || reg.includes('calf')) return 'leg_knee_thigh';
        if (reg.includes('hand') || reg.includes('wrist') || reg.includes('finger') || reg.includes('foot') || reg.includes('ankle') || reg.includes('toe')) return 'hands_feet';
        return 'default';
    }

    function generateOfflineResponse(message) {
        const msg = message.toLowerCase();
        
        // If we have a diagnosed condition, prioritize its specific treatment protocol
        if (lastOfflineResult && lastOfflineResult.treatmentProtocol) {
            const proto = lastOfflineResult.treatmentProtocol;
            const conditionName = lastOfflineResult.possibleConditions ? lastOfflineResult.possibleConditions[0] : 'your condition';
            
            if (msg.includes('cure') || msg.includes('treatment') || msg.includes('remedy') || msg.includes('fix')) {
                return `For ${conditionName}, the recommended treatment protocol is:\n\n**Immediate Actions:**\n• ${proto.immediateActions.join('\n• ')}\n\n**24-Hour Care Plan:**\n• ${proto.careplan24h.join('\n• ')}`;
            }
            if (msg.includes('medication') || msg.includes('medicine') || msg.includes('pill') || msg.includes('drug') || msg.includes('otc')) {
                return `For ${conditionName}, the recommended over-the-counter medications are:\n\n• ${proto.otcMedications.join('\n• ')}\n\n*Always consult a pharmacist before starting new medications.*`;
            }
            if (msg.includes('food') || msg.includes('eat') || msg.includes('diet') || msg.includes('drink')) {
                return `Regarding diet for ${conditionName}:\n\n• ${proto.dietaryAdvice.join('\n• ')}`;
            }
            if (msg.includes('risk') || msg.includes('dangerous') || msg.includes('warning') || msg.includes('emergency') || msg.includes('worse')) {
                return `**ESCALATION WARNING SIGNS:**\nPlease seek immediate emergency care if you experience:\n\n• ${proto.escalationSigns.join('\n• ')}`;
            }
        }

        // Generic Fallbacks if no specific condition was analyzed yet or they ask something else
        if (msg.includes('cure') || msg.includes('treatment') || msg.includes('remedy')) {
            return "Based on general guidelines, treatments involve adequate rest, hydration, and depending on severity, NSAIDs like ibuprofen. However, for a specific cure, please complete a symptom check first.";
        }
        if (msg.includes('risk') || msg.includes('dangerous') || msg.includes('warning') || msg.includes('emergency')) {
            return "Warning signs include sudden onset of severe maximum pain, difficulty breathing, chest pressure, facial drooping, high fever, or loss of consciousness. If any of these are present, call 112 immediately.";
        }
        if (msg.includes('medication') || msg.includes('medicine') || msg.includes('pill') || msg.includes('drug')) {
            return "For mild pain, OTC options include Ibuprofen (400mg every 6-8 hrs) or Acetaminophen (500mg every 4-6 hrs). Do NOT take NSAIDs if you suspect stomach ulcers or internal bleeding.";
        }
        if (msg.includes('food') || msg.includes('eat') || msg.includes('diet') || msg.includes('drink')) {
            return "Stay hydrated with 2-3 liters of water daily. Focus on anti-inflammatory foods like berries, leafy greens, and omega-3 rich fish.";
        }
        if (msg.includes('exercise') || msg.includes('stretch') || msg.includes('workout')) {
            return "During acute pain or illness, strenuous exercise should be paused. Focus on gentle, pain-free range-of-motion movements.";
        }
        if (msg.includes('sleep') || msg.includes('insomnia') || msg.includes('bed')) {
            return "Quality sleep (7-9 hours) is essential for immune function and tissue repair. Keep your room cool, dark, and quiet.";
        }
        if (msg.includes('thank') || msg.includes('hello') || msg.includes('hi')) {
            return "Hello! I am Salud AI's clinical engine. I'm here to provide health insights. What specific symptoms or questions do you have today?";
        }
        
        // Ultimate Fallback
        if (lastOfflineResult && lastOfflineResult.possibleConditions) {
            return `I'm tracking your symptoms for **${lastOfflineResult.possibleConditions[0]}**. You can ask me for the specific **cure/treatment**, **medications**, **dietary advice**, or **warning signs** for this condition!`;
        }
        
        return "I understand your concern. While I am operating in offline mode, I recommend monitoring your symptoms closely. If symptoms worsen rapidly, please consult a healthcare professional. Can I provide information on OTC medications, diet, or warning signs?";
    }

    // Initialize API key and Demo Mode from localStorage
    function init() {
        apiKey = localStorage.getItem('healthPulse_apiKey') || '';
        demoMode = localStorage.getItem('healthPulse_demoMode') === 'true';
    }

    window.AIEngine = {
        init: init,
        isConfigured: function () {
            return !!apiKey || demoMode;
        },
        isDemoMode: function () {
            return demoMode;
        },
        setApiKey: function (key) {
            apiKey = key;
            localStorage.setItem('healthPulse_apiKey', key);
            demoMode = false;
            localStorage.setItem('healthPulse_demoMode', 'false');
        },
        clearApiKey: function () {
            apiKey = '';
            localStorage.removeItem('healthPulse_apiKey');
        },
        analyzeSymptoms: async function (symptoms) {
            if (this.isDemoMode() || !apiKey) {
                await delay();
                
                // 1. Try to match against the specific DiseaseDB first
                let matchedDisease = null;
                if (window.DiseaseDB && symptoms.symptoms && symptoms.symptoms.length > 0) {
                    const searchStr = symptoms.symptoms.join(' ').toLowerCase();
                    for (const disease of window.DiseaseDB) {
                        if (disease.keywords && disease.keywords.some(kw => searchStr.includes(kw.toLowerCase()))) {
                            matchedDisease = disease.data;
                            break;
                        }
                    }
                }
                
                let result;
                
                if (matchedDisease) {
                    // Exact disease match found!
                    result = {
                        urgency: matchedDisease.urgency,
                        title: matchedDisease.title,
                        summary: matchedDisease.summary,
                        possibleConditions: matchedDisease.possibleConditions,
                        recommendations: matchedDisease.recommendations,
                        homeRemedies: matchedDisease.homeRemedies,
                        warningSign: matchedDisease.warningSign,
                        followUpQuestion: matchedDisease.followUpQuestion,
                        treatmentProtocol: matchedDisease.treatmentProtocol
                    };
                } else {
                    // Fallback to generic clinical body region logic
                    const severityInt = symptoms.severity || 1;
                    const severityCategory = severityInt >= 4 ? 'severe' : 'mild';
                    
                    let primaryRegion = 'default';
                    if (symptoms.regions && symptoms.regions.length > 0) {
                        primaryRegion = mapRegionToCategory(symptoms.regions[0]);
                    }
                    
                    const data = clinicalDB[primaryRegion][severityCategory];
                    
                    let contextualSummary = data.summary;
                    if (symptoms.symptoms && symptoms.symptoms.length > 0) {
                        contextualSummary += ` Given your specific symptom of ${symptoms.symptoms[0]}, we highly advise monitoring your condition closely.`;
                    }
    
                    result = {
                        urgency: data.urgency,
                        title: data.title,
                        summary: contextualSummary,
                        possibleConditions: data.possibleConditions,
                        recommendations: data.recommendations,
                        homeRemedies: data.homeRemedies,
                        warningSign: data.warningSign,
                        followUpQuestion: data.followUpQuestion,
                        treatmentProtocol: data.treatmentProtocol
                    };
                }
                
                conversationHistory.push({ role: 'user', content: JSON.stringify(symptoms) });
                conversationHistory.push({ role: 'assistant', content: JSON.stringify(result) });
                
                lastOfflineResult = result;
                
                return result;
            } else {
                return this._callGeminiAPI(symptoms, 'analyze');
            }
        },
        getHealthInsights: async function (vitals, condition) {
            if (this.isDemoMode() || !apiKey) {
                await delay();
                // Return format that dashboard.js expects
                if (!vitals || (Array.isArray(vitals) && vitals.length === 0)) {
                    return {
                        overallAssessment: "No vitals logged yet. Log your first vital reading to generate insights.",
                        trends: [],
                        recommendations: ["Log blood pressure or blood sugar readings to calculate trend patterns."],
                        alerts: [],
                        encouragement: "Tracking your vitals regularly is the first step toward proactive health self-management!"
                    };
                }
                
                const sorted = Array.isArray(vitals) ? [...vitals].sort((a,b) => b.timestamp - a.timestamp) : [];
                let overall = "Your vital readings have been reviewed. ";
                let trends = [];
                let recommendations = ["Continue logging vitals at consistent times daily.", "Maintain proper hydration and sleep hygiene."];
                let alerts = [];
                let encouragement = "Consistency in logging vitals gives you and your doctor valuable long-term insights.";
                
                const bpReadings = sorted.filter(v => v.type === 'bloodPressure');
                const bsReadings = sorted.filter(v => v.type === 'bloodSugar');
                const hrReadings = sorted.filter(v => v.type === 'heartRate');
                
                if (bpReadings.length > 0) {
                    const latest = bpReadings[0];
                    const sys = latest.value;
                    const dia = latest.value2 || 80;
                    let bpStatus = "normal";
                    if (sys >= 180 || dia >= 120) { bpStatus = "crisis"; alerts.push(`CRITICAL: Blood pressure ${sys}/${dia} mmHg — Hypertensive Crisis. Seek emergency care.`); }
                    else if (sys >= 140 || dia >= 90) { bpStatus = "hypertension-stage2"; alerts.push(`High BP: ${sys}/${dia} mmHg (Stage 2).`); recommendations.push("Limit sodium to <1,500 mg/day."); }
                    else if (sys >= 130 || dia >= 80) { bpStatus = "hypertension-stage1"; recommendations.push("30 min light cardio daily."); }
                    trends.push({ vital: "Blood Pressure", trend: bpReadings.length > 1 ? (bpReadings[0].value > bpReadings[1].value ? "increasing" : "decreasing") : "stable", detail: `Latest BP: ${sys}/${dia} mmHg (${bpStatus}).` });
                    overall += `Blood pressure: ${bpStatus}. `;
                }
                
                if (bsReadings.length > 0) {
                    const val = bsReadings[0].value;
                    let bsStatus = "stable";
                    if (val >= 250) { bsStatus = "severe-hyperglycemia"; alerts.push(`High glucose: ${val} mg/dL.`); }
                    else if (val >= 140) { bsStatus = "mild-hyperglycemia"; recommendations.push("Limit carbs for next meal."); }
                    else if (val < 70) { bsStatus = "hypoglycemia"; alerts.push(`Low glucose: ${val} mg/dL. Treat immediately.`); }
                    trends.push({ vital: "Glucose", trend: bsReadings.length > 1 ? (bsReadings[0].value > bsReadings[1].value ? "increasing" : "decreasing") : "stable", detail: `Latest glucose: ${val} mg/dL (${bsStatus}).` });
                    overall += `Glucose: ${bsStatus}. `;
                }
                
                if (hrReadings.length > 0) {
                    const val = hrReadings[0].value;
                    let hrStatus = "normal";
                    if (val > 100) { hrStatus = "tachycardia"; recommendations.push("Monitor resting heart rate."); }
                    else if (val < 60) { hrStatus = "bradycardia"; }
                    trends.push({ vital: "Heart Rate", trend: "stable", detail: `Latest HR: ${val} bpm (${hrStatus}).` });
                }
                
                return { overallAssessment: overall, trends, recommendations, alerts, encouragement, isDemo: true };
            } else {
                return this._callGeminiAPI({ vitals, condition }, 'insights');
            }
        },
        sendFollowUp: async function (message) {
            conversationHistory.push({ role: 'user', content: message });
            
            const msg = message.toLowerCase();
            if (msg.includes('severe') || msg.includes('heart attack') || msg.includes('stroke') || msg.includes('dying') || msg.includes('unconscious') || msg.includes('chest pain') || msg.includes('cannot breathe')) {
                setTimeout(() => {
                    if (window.App && typeof window.App.showModal === 'function') {
                        window.App.showModal('emergency-modal');
                    }
                }, 300);
                const alertReply = "⚠️ **CRITICAL ALERT:** Your message indicates a potentially life-threatening emergency. Please use the alert prompt on your screen to contact emergency services immediately.";
                conversationHistory.push({ role: 'assistant', content: alertReply });
                return alertReply;
            }
            
            if (this.isDemoMode() || !apiKey) {
                await delay();
                const reply = generateOfflineResponse(message);
                conversationHistory.push({ role: 'assistant', content: reply });
                return reply;
            } else {
                return this._callGeminiAPI({ message }, 'chat');
            }
        },
        getConversationHistory: function () {
            return conversationHistory;
        },
        clearConversation: function () {
            conversationHistory = [];
        },

        // --- INTERNAL GEMINI API INTEGRATION ---
        _callGeminiAPI: async function (payload, contextType) {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            
            let systemPrompt = "You are Salud AI, an advanced, clinically accurate medical decision engine. Provide structured, empathetic, and medically sound advice.";
            
            if (contextType === 'analyze') {
                systemPrompt += ` Analyze the following symptoms payload: ${JSON.stringify(payload)}. 
                Respond EXACTLY in this JSON format (no markdown code blocks, just raw JSON string):
                { 
                  "urgency": "low"|"medium"|"high"|"emergency",
                  "title": "...", 
                  "summary": "...", 
                  "possibleConditions": ["..."], 
                  "recommendations": ["..."], 
                  "homeRemedies": ["..."], 
                  "warningSign": "...", 
                  "followUpQuestion": "...", 
                  "treatmentProtocol": { 
                    "immediateActions": ["..."], 
                    "careplan24h": ["..."], 
                    "escalationSigns": ["..."], 
                    "otcMedications": ["..."], 
                    "dietaryAdvice": ["..."] 
                  } 
                }`;
            } else if (contextType === 'insights') {
                systemPrompt += ` Provide general health insights based on vitals: ${JSON.stringify(payload.vitals)} and condition: ${payload.condition}. Respond in JSON format: { "insight": "...", "recommendations": ["..."] }`;
            } else if (contextType === 'chat') {
                systemPrompt += ` The user says: "${payload.message}". Respond as a helpful medical assistant. Provide a plain text string response, no JSON. Address their question empathetically and accurately.`;
            }

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: systemPrompt }] }],
                        generationConfig: { temperature: 0.2 }
                    })
                });

                if (!response.ok) {
                    throw new Error(`API returned ${response.status}`);
                }

                const data = await response.json();
                let textResult = data.candidates[0].content.parts[0].text;
                
                if (contextType === 'chat') {
                    conversationHistory.push({ role: 'assistant', content: textResult });
                    return textResult;
                }
                
                // Strip possible markdown wrapping for JSON
                textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
                const parsedResult = JSON.parse(textResult);
                
                if (contextType === 'analyze') {
                     conversationHistory.push({ role: 'assistant', content: JSON.stringify(parsedResult) });
                }
                
                return parsedResult;

            } catch (error) {
                console.error("Salud AI API Error:", error);
                if (contextType === 'chat') {
                    return generateOfflineResponse(payload.message); // fallback
                }
                // Fallback to offline analysis if API fails
                if (contextType === 'analyze') {
                    // Temporarily set demo mode to use offline DB
                    const currentDemo = demoMode;
                    demoMode = true;
                    const result = await this.analyzeSymptoms(payload);
                    demoMode = currentDemo;
                    return result;
                }
                throw error;
            }
        }
    };
    
    // Auto-initialize on load
    window.AIEngine.init();

})();
