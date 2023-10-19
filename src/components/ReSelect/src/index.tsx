import { defineComponent, ref, type PropType, onMounted } from "vue";

interface OptionType {
  value: string | number;
  label: string | number;
}

const props = {
  standOptions: {
    type: Array as PropType<OptionType[]>,
    default: []
  },
  optionsApi: {
    type: Function,
    default: undefined
  },
  popKeys: {
    type: Object as PropType<OptionType>,
    default: {
      label: "label",
      value: "value"
    }
  }
};

export default defineComponent({
  name: "ReSelect",
  props,
  emits: [],
  setup(props, { attrs }) {
    const { standOptions, optionsApi, popKeys } = props;
    const loading = ref(true);
    const useOptions = ref([]);
    const search_params = ref({});

    function selectChange(visible: boolean) {
      if (visible && optionsApi) {
        optionsApi().then(res => {
          useOptions.value = res.data;
          loading.value = false;
        });
      }
    }

    function remoteFilter(value) {
      if (!value) return;
      search_params.value[popKeys.label] = value;
      console.log(search_params.value);
    }

    onMounted(() => {
      if (!optionsApi) {
        loading.value = false;
        useOptions.value = standOptions;
      } else {
        document.addEventListener("scroll", () => {
          console.log("22222222");
        });
      }
    });

    return () => (
      <>
        <el-select
          loading={loading.value}
          {...attrs}
          onVisibleChange={selectChange}
          filterMethod={optionsApi ? remoteFilter : null}
          id="cusSelect"
        >
          {useOptions.value?.map((option, index) => (
            <el-option
              key={index}
              label={option[popKeys.label]}
              value={option[popKeys.value]}
            />
          ))}
        </el-select>
      </>
    );
  }
});
