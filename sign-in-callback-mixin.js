export default {
  async created() {
    const path = await this.$store.dispatch('auth/signInCallback')
    this.$router.push(path)
  },
  methods: {
    cancel() {
      this.$router.push('/')
    }
  }
}