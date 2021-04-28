<script>
import {mapGetters} from "vuex";
import getters from "../store/gettersSchoolRoutePlanning";

export default {
    name: "SchoolRoutePlanningRouteInformation",
    computed: {
        ...mapGetters("Tools/SchoolRoutePlanning", Object.keys(getters))
    }

};
</script>

<template>
    <div
        v-if="routeDescription.length > 0"
        class="route-information-container"
    >
        <div class="result col-xs-12">
            <p>
                {{ $t("additional:modules.tools.routingToSchool.totalLength") }}
                <span>
                    {{ routeLength }}
                </span>
            </p>
            <br>
            <p>
                <small>
                    {{ $t("additional:modules.tools.routingToSchool.from") }}
                </small>
            </p>
            <p>
                <span>
                    {{ inputAddress }}
                </span>
            </p>
            <br>
            <p>
                <small>
                    {{ $t("additional:modules.tools.routingToSchool.to") }}
                </small>
            </p>
            <p>
                <span>
                    {{ `${selectedSchool.get("schulname")}, ${routeElements.SchuleingangTyp} (${routeElements.SchuleingangAdresse})` }}
                </span>
            </p>
        </div>
        <div class="description col-xs-12">
            <button
                type="button"
                class="btn btn-default btn-sm btn-block"
                data-toggle="collapse"
                data-target="#route-description"
            >
                {{ $t("additional:modules.tools.routingToSchool.showRouteDescription") }}
            </button>
            <ol
                id="route-description"
                class="collapse"
            >
                <li
                    v-for="routePart in routeDescription"
                    :key="routePart.id"
                >
                    {{ routePart[1] }}
                </li>
            </ol>
        </div>
    </div>
</template>

<style lang="less" scoped>
@import "~variables";
@font_family_1: "MasterPortalFont Bold","Arial Narrow",Arial,sans-serif;
@background_color_1: rgb(229, 229, 229);

    .route-information-container {
        span {
            font-family: @font_family_1;
            font-size: 15px;
        }

        .result {
            background-color: @background_color_1;
            p {
                &:first-child {
                    padding-top: 20px;
                }
                &:last-child {
                    padding-bottom: 20px;
                }
            }
        }

        .description {
            button {
                margin: 20px 0;
            }
            ol {
                padding-left: 15px;
            }
            li {
                padding-bottom: 5px;
            }
        }

        @media (max-width: 767px) {
            .description {
                ol {
                    font-size: 14px;
                }
                label {
                    font-size: 14px;
                }
            }
        }
    }

</style>
