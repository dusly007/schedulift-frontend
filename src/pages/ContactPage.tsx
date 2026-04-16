function ContactPage() {
    return (
    <div>
        <h1>Contact</h1>
        <p>Pour toute question ou demande d'assistance, veuillez nous contacter à l'adresse suivante :</p>
            <input type="text" placeholder="Nom" />
            <input type="email" placeholder="Courriel" />
            <textarea placeholder="Votre message:" />
            <button type="submit">Envoyer</button>
    </div>
    );
}

export default ContactPage;