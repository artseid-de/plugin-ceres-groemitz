import TranslationService from "services/TranslationService";
const NotificationService = require("services/NotificationService");

Vue.component("invoice-address-select", {

    delimiters: ["${", "}"],

    template: `
        <address-select 
            ref="invoice"
            @address-changed="addressChanged"
            address-type="1"
            :show-error="showError"
            :optional-address-fields="optionalAddressFields"
            :required-address-fields="requiredAddressFields">
        </address-select>
    `,

    props: {
        optionalAddressFields: {
            type: Object,
            default: () =>
            {
                return {};
            }
        },
        requiredAddressFields: {
            type: Object,
            default: () =>
            {
                return {};
            }
        },
        hasToValidate: {
            type: Boolean,
            default: false
        }
    },

    computed: Vuex.mapState({
        billingAddressId: state => state.address.billingAddressId,
        billingAddressList: state => state.address.billingAddressList,
        showError: state => state.checkout.validation.invoiceAddress.showError
    }),

    /**
     * Initialise the event listener
     */
    created()
    {
        if (this.hasToValidate)
        {
            this.$store.commit("setInvoiceAddressValidator", this.validate);
        }
    },

    /**
     * If no address is related to the user, a popup will open to add an address
     */
    mounted()
    {
        this.$nextTick(() =>
        {
            if (!App.isShopBuilder && App.isCheckoutView && this.billingAddressList && this.billingAddressList.length <= 0)
            {
                this.$refs.invoice.showAddModal("initial");
            }
        });
    },

    methods:
    {
        /**
         * Update the invoice address
         * @param selectedAddress
         */
        addressChanged(selectedAddress)
        {
            this.$store.dispatch("selectAddress", { selectedAddress, addressType: "1" })
                .then(
                    response =>
                    {
                        document.dispatchEvent(new CustomEvent("afterInvoiceAddressChanged", { detail: this.billingAddressId }));
                    },
                    error =>
                    {

                    });

            if (this.hasToValidate)
            {
                this.validate();
            }
        },

        validate()
        {
            const showError = this.billingAddressId <= 0;

            this.$store.commit("setInvoiceAddressShowError", showError);

            if (showError)
            {
                NotificationService.error(
                    TranslationService.translate("Ceres::Template.checkoutCheckInvoiceAddress")
                );
            }
        }
    },

    watch:
    {
        billingAddressId()
        {
            if (this.hasToValidate && this.showError)
            {
                this.validate();
            }
        }
    }
});
