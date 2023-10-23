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
  remoteApi: {
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
    const { standOptions, remoteApi, popKeys } = props;
    const loading = ref(true);
    const useOptions = ref([]);

    const searchParams = { pageSize: 20 };

    function fetchRemoteData() {
      loading.value = true;
      remoteApi(searchParams).then(res => {
        useOptions.value = res.data.list;
        loading.value = false;
      });
    }

    function visibleChange(visible: boolean) {
      if (visible && remoteApi) {
        fetchRemoteData();
      }
    }

    function remoteFilter(value) {
      searchParams[popKeys.label] = value;
      if (value) {
        fetchRemoteData();
      }
    }

    onMounted(() => {
      if (!remoteApi) {
        loading.value = false;
        useOptions.value = standOptions;
      }
    });

    return () => (
      <>
        <el-select
          loading={loading.value}
          {...attrs}
          onVisibleChange={visibleChange}
          remote={remoteApi ? true : false}
          remoteMethod={remoteApi ? remoteFilter : null}
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
