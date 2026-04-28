function SignupPage() {
    return (
        <div style={styles.container}>
            <div style={styles.form}>
                <h1 style={styles.title}>Inscription</h1>

                <p style={styles.subtitle}>
                    Déjà membre ? <Link to="/login" style={styles.link}>Se connecter</Link>
                </p>

                {error && <p style={styles.error}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label style={styles.label}>Courriel</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={styles.input}
                            placeholder="exemple@email.com"
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={styles.input}
                            placeholder="Créez un mot de passe"
                            required
                        />
                    </div>

                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? "Inscription..." : "S'inscrire"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SignupPage;