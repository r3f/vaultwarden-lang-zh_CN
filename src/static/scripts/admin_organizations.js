"use strict";
/* eslint-env es2017, browser, jquery */
/* global _post:readable, BASE_URL:readable, reload:readable, jdenticon:readable */

function deleteOrganization(event) {
    event.preventDefault();
    event.stopPropagation();
    const org_uuid = event.target.dataset.vwOrgUuid;
    const org_name = event.target.dataset.vwOrgName;
    const billing_email = event.target.dataset.vwBillingEmail;
    if (!org_uuid) {
        alert("未找到必需的参数！");
        return false;
    }

    // 首先确保用户想要删除此组织
    const continueDelete = confirm(`警告：此组织(${org_name})的所有数据将丢失!\n请确保您有备份，此操作无法撤销!`);
    if (continueDelete == true) {
        const input_org_uuid = prompt(`要删除组织"${org_name} (${billing_email})"，请在下面输入组织 UUID。`);
        if (input_org_uuid != null) {
            if (input_org_uuid == org_uuid) {
                _post(`${BASE_URL}/admin/organizations/${org_uuid}/delete`,
                    "组织已成功删除",
                    "删除组织时出错"
                );
            } else {
                alert("错误的组织 UUID，请重试");
            }
        }
    }
}

function initActions() {
    document.querySelectorAll("button[vw-delete-organization]").forEach(btn => {
        btn.addEventListener("click", deleteOrganization);
    });

    if (jdenticon) {
        jdenticon();
    }
}

// 在加载时执行的事件
document.addEventListener("DOMContentLoaded", (/*event*/) => {
    jQuery("#orgs-table").DataTable({
        "drawCallback": function() {
            initActions();
        },
        "stateSave": true,
        "responsive": true,
        "lengthMenu": [
            [-1, 5, 10, 25, 50],
            ["全部", 5, 10, 25, 50]
        ],
        "pageLength": -1, // 默认显示所有
        "columnDefs": [{
            "targets": [4,5],
            "searchable": false,
            "orderable": false
        }]
    });

    // 为组织操作添加点击事件
    initActions();

    const btnReload = document.getElementById("reload");
    if (btnReload) {
        btnReload.addEventListener("click", reload);
    }
});
