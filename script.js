document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('.input-container input');
    const button = document.querySelector('.input-container button');
    const beneficiairesCol = document.querySelector('.col-beneficiaires');
    const tableBody = document.getElementById('table-body'); // Référence au corps du tableau des trajets

    // Charger les bénéficiaires depuis le localStorage
    let beneficiaires = JSON.parse(localStorage.getItem('beneficiaires')) || [];

    // Fonction pour afficher les bénéficiaires dans la colonne
    function afficherBeneficiaires() {
        beneficiairesCol.innerHTML = '';
        beneficiaires.sort(); // Trier les bénéficiaires par ordre alphabétique

        beneficiaires.forEach((beneficiaire, index) => {
            const div = document.createElement('div');
            div.classList.add('beneficiaire');
            div.textContent = beneficiaire;
            div.addEventListener('dblclick', () => supprimerBeneficiaire(index)); // Suppression au double-clic
            div.addEventListener('click', () => ajouterTrajet(beneficiaire)); // Ajout de trajet au clic
            beneficiairesCol.appendChild(div);
        });
    }

    // Fonction pour ajouter un nouveau bénéficiaire
    function ajouterBeneficiaire() {
        const nom = input.value.trim();
        if (nom && !beneficiaires.includes(nom)) {
            beneficiaires.push(nom);
            localStorage.setItem('beneficiaires', JSON.stringify(beneficiaires));
            afficherBeneficiaires();
            input.value = ''; // Réinitialiser l'input
        }
    }

    // Fonction pour supprimer un bénéficiaire
    function supprimerBeneficiaire(index) {
        beneficiaires.splice(index, 1);
        localStorage.setItem('beneficiaires', JSON.stringify(beneficiaires));
        afficherBeneficiaires();
    }

    // Fonction pour ajouter une paire de bénéficiaires dans la colonne "col-trajet" et initialiser les distances dans "col-calcul"
    function ajouterTrajet(beneficiaire) {
        const selectedRow = document.querySelector('.col-a input[type="checkbox"]:checked');

        if (selectedRow) {
            const row = selectedRow.closest('tr'); // Récupérer la ligne de la case à cocher
            const colTrajet = row.querySelector('.col-trajet'); // Récupérer la cellule de la colonne "col-trajet"
            const colCalcul = row.querySelector('.col-calcul'); // Récupérer la cellule de la colonne "col-calcul"

            // Ajouter le bénéficiaire dans "col-trajet" sous forme de span
            const span = document.createElement('span');
            span.className = 'beneficiaire-item';
            span.textContent = beneficiaire;

            // Ajouter un événement de clic pour supprimer le bénéficiaire de la colonne "col-trajet"
            span.addEventListener('click', () => {
                span.remove();
                mettreAJourCalcul(row); // Mettre à jour les calculs après suppression
            });

            if (colTrajet.textContent) {
                colTrajet.appendChild(document.createTextNode(', ')); // Ajouter une virgule avant le nouvel élément
            }
            colTrajet.appendChild(span);

            // Mettre à jour la cellule de calcul pour afficher la distance
            mettreAJourCalcul(row);
			mettreAJourTotalDistance(row); // Mettre à jour le total après ajout
        }
    }

    // Fonction pour mettre à jour dynamiquement les distances dans "col-calcul"
    function mettreAJourCalcul(row) {
        const colTrajet = row.querySelector('.col-trajet');
        const colCalcul = row.querySelector('.col-calcul');

        const beneficiaries = Array.from(colTrajet.querySelectorAll('.beneficiaire-item')); // Récupérer tous les bénéficiaires
        const distances = [];

        // Créer la chaîne de distance
        beneficiaries.forEach((beneficiaire, index) => {
            if (index < beneficiaries.length - 1) {
                const pairKey = `${beneficiaire.textContent}, ${beneficiaries[index + 1].textContent}`; // Créer une clé pour la paire
                const distance = localStorage.getItem(pairKey) || '0'; // Récupérer la distance ou 0 si pas défini
                distances.push(distance);
            }
        });

        // Afficher chaque distance individuellement dans col-calcul
        colCalcul.innerHTML = distances.map((distance, index) => 
            `<span class="distance-item" data-index="${index}">${distance}</span>`
        ).join(' + '); // Afficher 0 + 0 + 0 + ...

        // Ajouter un événement de clic sur chaque distance
        colCalcul.querySelectorAll('.distance-item').forEach(item => {
            item.addEventListener('click', () => {
                const beneficiary1 = beneficiaries[item.dataset.index].textContent; // Récupérer le nom du bénéficiaire 1
                const beneficiary2 = beneficiaries[parseInt(item.dataset.index) + 1].textContent; // Récupérer le nom du bénéficiaire 2
                modifierDistance(item, beneficiary1, beneficiary2); // Passer les noms au lieu de l'index
            });
        });
    }

    // Fonction pour modifier une distance dans "col-calcul"
    function modifierDistance(distanceItem, beneficiary1, beneficiary2) {
        const pairKey = `${beneficiary1}, ${beneficiary2}`; // Clé pour la paire
        const nouvelleDistance = prompt('Entrez la nouvelle distance (format: 0,0)', distanceItem.textContent);

        if (nouvelleDistance && /^[\d]+(,[\d]+)?$/.test(nouvelleDistance)) {
            // Convertir la distance en nombre et arrondir à une décimale
            const distanceArrondie = (Math.round(parseFloat(nouvelleDistance.replace(',', '.')) * 10) / 10).toFixed(1).replace('.', ',');

            distanceItem.textContent = distanceArrondie; // Met à jour la distance

            // Mettre à jour la distance dans le localStorage
            localStorage.setItem(pairKey, distanceArrondie); // Enregistrer avec la clé unique

            // Mettre à jour le total des distances après modification
            const row = distanceItem.closest('tr'); // Récupérer la ligne
            mettreAJourTotalDistance(row); // Met à jour le total pour la ligne actuelle
        } else {
            alert("Veuillez entrer une distance valide (ex: 2,8 ou 3,5).");
        }
    }

    // Fonction pour mettre à jour dynamiquement le total des distances
    function mettreAJourTotalDistance(row) {
        const colCalcul = row.querySelector('.col-calcul');
        const totalCell = row.querySelector('.col-total'); // Cellule pour afficher le total des distances

        // Extraire les distances de la cellule "col-calcul"
        const distances = Array.from(colCalcul.querySelectorAll('.distance-item')).map(item => Number(item.textContent.replace(',', '.')));

        if (distances) {
            const totalDistance = distances.reduce((acc, curr) => acc + curr, 0); // Somme de toutes les distances

            totalCell.textContent = `${totalDistance.toFixed(1).replace('.', ',')} km`; // Afficher le total avec une décimale
        }
    }

    // Ajouter bénéficiaire au clic du bouton
    button.addEventListener('click', ajouterBeneficiaire);

    // Appuyer sur "Entrée" dans l'input pour ajouter un bénéficiaire
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            ajouterBeneficiaire();
        }
    });

    // Afficher les bénéficiaires au chargement
    afficherBeneficiaires();
});

// Fonction pour afficher les jours (à conserver tel quel)
function afficherJours() {
    const mois = document.getElementById('mois').value;
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = ''; // Vide le tableau avant d'ajouter les jours

    const annee = new Date().getFullYear();
    let nombreJours;

    const joursFeries = {
        '1': [1],
        '5': [1, 8],
        '7': [14],
        '8': [15],
        '11': [1, 11],
        '12': [25]
    };

    function calculerDateFerieMobile(annee) {
        const paques = calculerDatePaques(annee);
        const ascension = new Date(paques);
        ascension.setDate(paques.getDate() + 39);
        const pentecote = new Date(paques);
        pentecote.setDate(paques.getDate() + 50);
        return { ascension, pentecote };
    }

    function calculerDatePaques(annee) {
        const a = annee % 19;
        const b = Math.floor(annee / 100);
        const c = annee % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const mois = Math.floor((h + l - 7 * m + 114) / 31);
        const jour = ((h + l - 7 * m + 114) % 31) + 1;
        return new Date(annee, mois - 1, jour);
    }

    const joursFeriesMobiles = calculerDateFerieMobile(annee);

    switch (mois) {
        case '2':
            nombreJours = (annee % 4 === 0 && annee % 100 !== 0) || annee % 400 === 0 ? 29 : 28;
            break;
        case '4':
        case '6':
        case '9':
        case '11':
            nombreJours = 30;
            break;
        default:
            nombreJours = 31;
    }

    for (let i = 1; i <= nombreJours; i++) {
        const date = new Date(annee, mois - 1, i);
        const row = document.createElement('tr');

        const colA = document.createElement('td');
        colA.className = 'col-a';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        colA.appendChild(checkbox);
        row.appendChild(colA);

        const spacer1 = document.createElement('td');
        spacer1.className = 'spacer';
        row.appendChild(spacer1);

        const colJours = document.createElement('td');
        colJours.className = 'col-jours';
        colJours.textContent = i;
        if (date.getDay() === 0) {
            colJours.classList.add('sunday');
        }

        if (joursFeries[mois] && joursFeries[mois].includes(i)) {
            colJours.classList.add('holiday');
        }

        if (
            (joursFeriesMobiles.ascension.getMonth() + 1 == mois && joursFeriesMobiles.ascension.getDate() == i) ||
            (joursFeriesMobiles.pentecote.getMonth() + 1 == mois && joursFeriesMobiles.pentecote.getDate() == i)
        ) {
            colJours.classList.add('holiday');
        }

        row.appendChild(colJours);

        const spacer2 = document.createElement('td');
        spacer2.className = 'spacer';
        row.appendChild(spacer2);

        const colTrajet = document.createElement('td');
        colTrajet.className = 'col-trajet';
        row.appendChild(colTrajet);

        const spacer3 = document.createElement('td');
        spacer3.className = 'spacer';
        row.appendChild(spacer3);

        const colCalcul = document.createElement('td');
        colCalcul.className = 'col-calcul';
		colCalcul.textContent = ''; // Initialiser la colonne de calcul
        row.appendChild(colCalcul);

        const spacer4 = document.createElement('td');
        spacer4.className = 'spacer';
        row.appendChild(spacer4);

        const colTotal = document.createElement('td');
        colTotal.className = 'col-total';
		colTotal.textContent = ''; // Initialiser la colonne total à 0 km
        row.appendChild(colTotal);

        tableBody.appendChild(row);
    }
}
