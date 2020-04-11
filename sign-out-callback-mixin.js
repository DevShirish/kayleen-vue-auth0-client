export default {
  async created() {
    await this.$store.dispatch('auth/signOutCallback')
    this.$router.push('/')
  }
}