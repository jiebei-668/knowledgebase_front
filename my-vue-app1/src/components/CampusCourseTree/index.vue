<template>
    <div class="cate-tree">
        <div class="cate-tree__tree">
            <a-spin :loading="loading">
                <a-scrollbar style="height: 100%; overflow: auto" outer-style="height: 100%">
                    <a-tree ref="treeRef" show-line size="mini" :data="treeData"
                            :field-names="{ key: 'id', title: 'name', children: 'children', icon: 'icon' }"
                            @select="select"
                            :selected-keys="selectedKeysRef"
                    >
                    </a-tree>
                </a-scrollbar>
            </a-spin>
        </div>
    </div>
</template>

<script setup lang="tsx">
import { mapTree } from 'xe-utils'
import GiSvgIcon from '@/components/GiSvgIcon/index.vue'
import { CourseTreeNodeType, getCampusCourseTrees } from '@/apis/course'
import { type TreeNodeData } from '@arco-design/web-vue'
import {Message} from '@arco-design/web-vue'


const selectedKeysRef = ref<string[]>([])
const treeRef = useTemplateRef('treeRef')
const treeData = ref([])
const loading = ref(false)

// 没选中返回null
const emit = defineEmits<{
    (e: 'node-click', selectedKey: string | null): void
    (e: 'node-dblclick', selectedKey: string | null): void
}>()
// 模拟双击
let lastClickTime = 0
let lastClickKey: string | null = null
const delay = 300
// 选中的操作，只允许选中课程节点，选择其他类型的节点如校区，学期等会提示
// 两次正确的选中操作间隔小于等于delay视作双击事件
const select = (selectedKeys: Array<string>, data: {
    selected?: boolean;
    selectedNodes: TreeNodeData[];
    node?: TreeNodeData;
    e?: Event;
}) => {

    if (data.selectedNodes[0].type != CourseTreeNodeType.CLASS) {
        emit('node-click', null)
        clearSelection()
        Message.warning('请选择班级节点')
        return
    }
    const currentTime = new Date().getTime()
    const timeSinceLastClick = currentTime - lastClickTime
    if(timeSinceLastClick <= delay && selectedKeys[0] === lastClickKey) {
        emit('node-dblclick', selectedKeys[0])
        lastClickTime = currentTime
        lastClickKey = selectedKeys[0]
        clearSelection()
        selectedKeysRef.value.push(selectedKeys[0])
        return
    }
    lastClickTime = currentTime
    lastClickKey = selectedKeys[0]
    emit('node-click', selectedKeys[0])
    clearSelection()
    selectedKeysRef.value.push(selectedKeys[0])
    return
}

// 清楚选中的节点
const clearSelection = () => {
    selectedKeysRef.value = []
}
// 返回选中的节点id，没选中返回null
const getSelectedKey = () => {
    if (selectedKeysRef.value.length > 0) {
        return selectedKeysRef.value[0]
    }
    return null
}

// 获取分类树
const getTreeData = async () => {
    try {
        loading.value = true
        const res = await getCampusCourseTrees()
        treeData.value = mapTree(res.data, (i) => ({
            ...i,
            icon: (node: any) => {
                if (node.isLeaf && i.type === CourseTreeNodeType.CLASS) return <GiSvgIcon name="file"
                                                                                          size={16}></GiSvgIcon>
                else return <GiSvgIcon name="file-open" size={16}></GiSvgIcon>
            }
        }))
        nextTick(() => {
            treeRef.value?.expandAll()
        })
    } finally {
        loading.value = false
    }
}
getTreeData()

// 返回引用
const getTreeLoading = () => {
    return loading
}
defineExpose({
    clearSelection,
    getSelectedKey,
    getTreeData,
    getTreeLoading,
})
</script>

<style lang="scss" scoped>
:deep(.arco-tree-node-title-text) {
    white-space: nowrap;
}

.cate-tree {
    flex: 1;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    &__search {
        margin-bottom: 10px;
    }

    &__tree {
        flex: 1;
        overflow: scroll;
        background-color: var(--color-bg-1);
        position: relative;
    }
}
</style>
