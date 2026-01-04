<!--
  @file 组件
  @description 头部右侧工具栏组件，包含项目配置、消息通知、全屏切换、主题切换和用户菜单等功能
-->
<template>
    <a-row justify="end" align="center">
        <a-space size="medium">
            <!-- 雅安老年大学管理平台 标题 -->
            <a-col class="pingtainame">雅安老年联盟信息化管理平台</a-col>
            <!-- <span class="pingtainame">雅安老年大学信息化管理平台</span> -->
            <!-- 项目配置按钮 -->
            <a-tooltip content="项目配置" position="bl">
                <a-button size="mini" class="gi_hover_btn" @click="handleOpenSettings">
                    <template #icon>
                        <icon-settings :size="18" />
                    </template>
                </a-button>
            </a-tooltip>

            <!-- 全屏切换按钮 -->
            <a-tooltip v-if="!['xs', 'sm'].includes(breakpoint)" content="全屏切换" position="bottom">
                <a-button size="mini" class="gi_hover_btn" @click="toggle">
                    <template #icon>
                        <icon-fullscreen v-if="!isFullscreen" :size="18" />
                        <icon-fullscreen-exit v-else :size="18" />
                    </template>
                </a-button>
            </a-tooltip>

            <!-- 暗黑模式切换 -->
            <a-tooltip content="主题切换" position="bottom">
                <GiThemeBtn></GiThemeBtn>
            </a-tooltip>

            <!-- 管理员账户 -->
            <a-dropdown trigger="hover">
                <a-row align="center" :wrap="false" class="user">
                    <span class="username">{{ userStore.name }}</span>
                    <icon-down />
                </a-row>

                <template #content>
                    <a-doption v-for="item in userMenuItems" :key="item.key" @click="item.onClick">
                        <template #icon>
                            <GiIconBox :color="item.iconColor">
                                <component :is="item.icon" />
                            </GiIconBox>
                        </template>
                        <span>{{ item.label }}</span>
                    </a-doption>
                    <a-divider :margin="0" />
                    <a-doption @click="handleLogout">
                        <template #icon>
                            <GiIconBox color="warning">
                                <icon-export />
                            </GiIconBox>
                        </template>
                        <span>退出登录</span>
                    </a-doption>
                </template>
            </a-dropdown>
        </a-space>
    </a-row>

    <SettingDrawer ref="SettingDrawerRef"></SettingDrawer>
</template>

<script setup lang="ts">
import { Message, Modal } from '@arco-design/web-vue'
import { useFullscreen } from '@vueuse/core'
import SettingDrawer from './SettingDrawer.vue'
import { useUserStore } from '@/stores'
import { useBreakpoint, useResetReactive } from '@/hooks'
import type { AccountDTO } from '@/apis/system'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useWindowSize } from '@vueuse/core/index'
import { updatePassword } from '@/apis/user'

/** 组件名称 */
defineOptions({ name: 'HeaderRight' })

/** 路由实例 */
const router = useRouter()

/** 状态管理 */
const userStore = useUserStore()

/** 响应式断点 */
const { breakpoint } = useBreakpoint()

/** 全屏控制 */
const { isFullscreen, toggle } = useFullscreen()

/** 组件引用 */
const SettingDrawerRef = useTemplateRef('SettingDrawerRef')

const { width } = useWindowSize()

/** 用户菜单配置 */
const userMenuItems = [
    {
        key: 'password',
        label: '修改密码',
        icon: 'icon-unlock',
        iconColor: 'primary',
        onClick: () => {
            onEdit()
        }
    }
]

/** 打开设置抽屉 */
const handleOpenSettings = () => {
    SettingDrawerRef.value?.open()
}

/** 处理退出登录 */
const handleLogout = () => {
    Modal.warning({
        title: '提示',
        content: '确认退出登录？',
        hideCancel: false,
        closable: true,
        onBeforeOk: async () => {
            try {
                await userStore.logout()
                router.replace('/login')
                return true
            } catch (error) {
                return false
            }
        }
    })
}
// 编辑表单，用于新增或者修改信息
let [editForm, resetForm] = useResetReactive<AccountDTO>({
    username: null,
    password: null

})
const editColumns = computed(() => [
    {
        type: 'input',
        label: '账号',
        field: 'username',
        props: {
            maxLength: 50,
            disabled: true
        },
        rules: [
            { maxLength: 49, message: '名称不超过50个字符' }
        ]
    },
    {
        type: 'input',
        label: '密码',
        field: 'password',
        props: {
            maxLength: 50
        },
        rules: [
            // { required: true, message: '请输入教师名称' },
            { maxLength: 49, message: '名称不超过50个字符' }
        ]
    }
] as ColumnItem<typeof editForm>[])
const GiFormRef = ref<InstanceType<typeof GiForm>>()
const onEdit = () => {
    resetForm()
    editForm.username = userStore.username
    Modal.open({
        title: '编辑',
        width: '90%',
        modalStyle: { maxWidth: '600px' },
        fullscreen: width.value < 600,
        content: () =>
            h(GiForm, {
                'ref': (e) => GiFormRef.value = e as InstanceType<typeof GiForm>,
                'columns': editColumns.value,
                'modelValue': editForm,
                'onUpdate:modelValue': (e) => Object.assign(editForm, e)
            }),
        onBeforeOk: async () => {
            try {
                const flag = await GiFormRef.value?.formRef?.validate()
                if (flag) return false
                // fixme
                updatePassword({ ...editForm }).then(res => {
                    const { code, data, message, success } = res
                    if (success) {
                        alert('更新信息成功！')
                        return true

                    }
                    // fixme 这里进行错误处理
                    alert('失败！')
                })
            } catch {
                return false
            }
        }
    })
}
</script>

<style lang="scss" scoped>
.arco-dropdown-open .arco-icon-down {
    transform: rotate(180deg);
}

.doption-icon {
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    color: #fff;
    border-radius: 4px;

    &.primary {
        background-color: rgba(var(--primary-6));
    }

    &.success {
        background-color: rgba(var(--success-6));
    }

    &.warning {
        background-color: rgba(var(--warning-6));
    }
}

.user {
    cursor: pointer;
    color: var(--color-text-1);

    .username {
        margin-left: 10px;
        white-space: nowrap;
    }

    .arco-icon-down {
        transition: all 0.3s;
        margin-left: 2px;
    }
}

.pingtainame {
    font-size: 16px; /* 设置字体大小 */
    font-weight: bold; /* 设置字体加粗 */
    font-family: SimSun, sans-serif; /* 设置字体为宋体 */
}
</style>
