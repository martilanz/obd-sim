OBD = On-Board Diagnostics
è il sistema con cui un'auto monitora sé stessa, rileva anomalie e rende disponibili informazioni diagnostiche.

Nasce per due motivi: 
1. Controllo delle emissioni
2. Diagnosi e manutenzione

PID: parametri live
Sono gli identificatori dei parametri leggibili (giri motore, velocità veicolo, temperatura motore, fuel level).
Il valore ricevuto è sempre in byte grezzi che vanno convertiti con delle formule: 

    PID richiesto -> risposta raw -> parsing -> valore leggibile    

(Di solito nel backend node serve una funzione di normalizzazione)

DTC: i codici di errore
I DTC sono i codici di guasto (es. P0301, P420, P071)
