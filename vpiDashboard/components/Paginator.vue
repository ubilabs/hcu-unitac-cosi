<script>
export default {
    name: "Paginator",
    props: {
        navigationFilter: {
            type: Object,
            required: false,
            default: () => ({name: "Paginator"})
        }, 
        subtitle: "",
    },
    methods: {
        previous () {
            this.$emit("pager", "previous");
            console.log(this.$parent.$data);
        },
        next () {
            this.$emit("pager", "next");
        }
    }
};
</script>

<template>
    <div class="d-flex w-100 justify-content-center align-items-center">
        <nav aria-label="navigation">
            <ul class="pagination">
                <li
                    class="page-item"
                    @click="previous"
                >
                    <a
                        class="page-link"
                        href="#"
                        aria-label="Previous"
                    >
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>
                <li class="page-item paginator-index">
                  {{ subtitle }}
                </li>
                <li
                    class="page-item"
                    @click="next"
                >
                    <a
                        class="page-link"
                        href="#"
                        aria-label="Next"
                    >
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
            </ul>
        </nav>
    </div>
</template>

<style scoped>
.pagination{
  padding:0;
  margin:0;
}
.paginator-index {
    margin: 0 0.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
