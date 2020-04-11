export default {
  async created() {
    await this.$store.dispatch('auth/signOutCallback')
    this.$router.push('/')
  },
  methods: {
    cancel() {
      this.$router.push('/')
    }
  }
}