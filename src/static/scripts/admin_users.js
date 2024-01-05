"use strict";
/* eslint-env es2017, browser, jquery */
/* global _post:readable, BASE_URL:readable, reload:readable, jdenticon:readable */

function deleteUser(event) {
    event.preventDefault();
    event.stopPropagation();
    const id = event.target.parentNode.dataset.vwUserUuid;
    const email = event.target.parentNode.dataset.vwUserEmail;
    if (!id || !email) {
        alert("未找到必需的参数！");
        return false;
    }
    const input_email = prompt(`要删除用户"${email}"，请在下面输入邮箱`);
    if (input_email != null) {
        if (input_email == email) {
            _post(`${BASE_URL}/admin/users/${id}/delete`,
                "用户已成功删除",
                "删除用户时出错"
            );
        } else {
            alert("错误的邮箱，请重试");
        }
    }
}

function remove2fa(event) {
    event.preventDefault();
    event.stopPropagation();
    const id = event.target.parentNode.dataset.vwUserUuid;
    const email = event.target.parentNode.dataset.vwUserEmail;
    if (!id || !email) {
        alert("未找到必需的参数！");
        return false;
    }
    const confirmed = confirm(`您确定要为"${email}"删除两步验证吗？`);
    if (confirmed) {
        _post(`${BASE_URL}/admin/users/${id}/remove-2fa`,
            "2FA已成功移除",
            "移除2FA时出错"
        );
    }
}

function deauthUser(event) {
    event.preventDefault();
    event.stopPropagation();
    const id = event.target.parentNode.dataset.vwUserUuid;
    const email = event.target.parentNode.dataset.vwUserEmail;
    if (!id || !email) {
        alert("未找到必需的参数！");
        return false;
    }
    const confirmed = confirm(`您确定要取消授权"${email}"的会话吗？`);
    if (confirmed) {
        _post(`${BASE_URL}/admin/users/${id}/deauth`,
            "会话已成功取消授权",
            "取消授权会话时出错"
        );
    }
}

function disableUser(event) {
    event.preventDefault();
    event.stopPropagation();
    const id = event.target.parentNode.dataset.vwUserUuid;
    const email = event.target.parentNode.dataset.vwUserEmail;
    if (!id || !email) {
        alert("未找到必需的参数！");
        return false;
    }
    const confirmed = confirm(`您确定要禁用用户"${email}"吗？这也将取消其会话的授权。`);
    if (confirmed) {
        _post(`${BASE_URL}/admin/users/${id}/disable`,
            "用户已成功禁用",
            "禁用用户时出错"
        );
    }
}

function enableUser(event) {
    event.preventDefault();
    event.stopPropagation();
    const id = event.target.parentNode.dataset.vwUserUuid;
    const email = event.target.parentNode.dataset.vwUserEmail;
    if (!id || !email) {
        alert("未找到必需的参数！");
        return false;
    }
    const confirmed = confirm(`您确定要启用用户"${email}"吗？`);
    if (confirmed) {
        _post(`${BASE_URL}/admin/users/${id}/enable`,
            "用户已成功启用",
            "启用用户时出错"
        );
    }
}

function updateRevisions(event) {
    event.preventDefault();
    event.stopPropagation();
    _post(`${BASE_URL}/admin/users/update_revision`,
        "成功，客户端将在下次连接时同步",
        "强制客户端同步时出错"
    );
}

function inviteUser(event) {
    event.preventDefault();
    event.stopPropagation();
    const email = document.getElementById("inviteEmail");
    const data = JSON.stringify({
        "email": email.value
    });
    email.value = "";
    _post(`${BASE_URL}/admin/invite`,
        "用户已成功邀请",
        "邀请用户时出错",
        data
    );
}

function resendUserInvite(event) {
    event.preventDefault();
    event.stopPropagation();
    const id = event.target.parentNode.dataset.vwUserUuid;
    const email = event.target.parentNode.dataset.vwUserEmail;
    if (!id || !email) {
        alert("未找到必需的参数！");
        return false;
    }
    const confirmed = confirm(`您确定要重新发送"${email}"的邀请吗？`);
    if (confirmed) {
        _post(`${BASE_URL}/admin/users/${id}/invite/resend`,
            "邀请已成功发送",
            "重新发送邀请时出错"
        );
    }
}

const ORG_TYPES = {
    "0": {
        "name": "所有者",
        "bg": "orange",
        "font": "black"
    },
    "1": {
        "name": "管理员",
        "bg": "blueviolet"
    },
    "2": {
        "name": "用户",
        "bg": "blue"
    },
    "3": {
        "name": "经理",
        "bg": "green"
    },
};

// 用于按 ISO 格式排序日期的特殊排序函数
jQuery.extend(jQuery.fn.dataTableExt.oSort, {
    "date-iso-pre": function(a) {
        let x;
        const sortDate = a.replace(/(<([^>]+)>)/gi, "").trim();
        if (sortDate !== "") {
            const dtParts = sortDate.split(" ");
            const timeParts = (undefined != dtParts[1]) ? dtParts[1].split(":") : ["00", "00", "00"];
            const dateParts = dtParts[0].split("-");
            x = (dateParts[0] + dateParts[1] + dateParts[2] + timeParts[0] + timeParts[1] + ((undefined != timeParts[2]) ? timeParts[2] : 0)) * 1;
            if (isNaN(x)) {
                x = 0;
            }
        } else {
            x = Infinity;
        }
        return x;
    },

    "date-iso-asc": function(a, b) {
        return a - b;
    },

    "date-iso-desc": function(a, b) {
        return b - a;
    }
});

const userOrgTypeDialog = document.getElementById("userOrgTypeDialog");
// 填充表单和标题
userOrgTypeDialog.addEventListener("show.bs.modal", function(event) {
    // 获取共享值
    const userEmail = event.relatedTarget.parentNode.dataset.vwUserEmail;
    const userUuid = event.relatedTarget.parentNode.dataset.vwUserUuid;
    // 获取组织特定值
    const userOrgType = event.relatedTarget.dataset.vwOrgType;
    const userOrgTypeName = ORG_TYPES[userOrgType]["name"];
    const orgName = event.relatedTarget.dataset.vwOrgName;
    const orgUuid = event.relatedTarget.dataset.vwOrgUuid;

    document.getElementById("userOrgTypeDialogTitle").innerHTML = `<b>更新用户类型：</b><br><b>组织：</b>${orgName}<br><b>用户：</b>${userEmail}`;
    document.getElementById("userOrgTypeUserUuid").value = userUuid;
    document.getElementById("userOrgTypeOrgUuid").value = orgUuid;
    document.getElementById(`userOrgType${userOrgTypeName}`).checked = true;
}, false);

// 防止在模态框隐藏后无意中提交带有有效元素的表单。
userOrgTypeDialog.addEventListener("hide.bs.modal", function() {
    document.getElementById("userOrgTypeDialogTitle").innerHTML = "";
    document.getElementById("userOrgTypeUserUuid").value = "";
    document.getElementById("userOrgTypeOrgUuid").value = "";
}, false);

function updateUserOrgType(event) {
    event.preventDefault();
    event.stopPropagation();

    const data = JSON.stringify(Object.fromEntries(new FormData(event.target).entries()));

    _post(`${BASE_URL}/admin/users/org_type`,
        "成功更新用户的组织类型",
        "更新用户组织类型时出错",
        data
    );
}

function initUserTable() {
    // 根据类型为所有组织按钮着色
    document.querySelectorAll("button[data-vw-org-type]").forEach(function(e) {
        const orgType = ORG_TYPES[e.dataset.vwOrgType];
        e.style.backgroundColor = orgType.bg;
        if (orgType.font !== undefined) {
            e.style.color = orgType.font;
        }
        e.title = orgType.name;
    });

    document.querySelectorAll("button[vw-remove2fa]").forEach(btn => {
        btn.addEventListener("click", remove2fa);
    });
    document.querySelectorAll("button[vw-deauth-user]").forEach(btn => {
        btn.addEventListener("click", deauthUser);
    });
    document.querySelectorAll("button[vw-delete-user]").forEach(btn => {
        btn.addEventListener("click", deleteUser);
    });
    document.querySelectorAll("button[vw-disable-user]").forEach(btn => {
        btn.addEventListener("click", disableUser);
    });
    document.querySelectorAll("button[vw-enable-user]").forEach(btn => {
        btn.addEventListener("click", enableUser);
    });
    document.querySelectorAll("button[vw-resend-user-invite]").forEach(btn => {
        btn.addEventListener("click", resendUserInvite);
    });

    if (jdenticon) {
        jdenticon();
    }
}

// 在加载时执行的事件
document.addEventListener("DOMContentLoaded", (/*event*/) => {
    jQuery("#users-table").DataTable({
        "drawCallback": function() {
            initUserTable();
        },
        "stateSave": true,
        "responsive": true,
        "lengthMenu": [
            [-1, 2, 5, 10, 25, 50],
            ["全部", 2, 5, 10, 25, 50]
        ],
        "pageLength": -1, // 默认显示所有
        "columnDefs": [{
            "targets": [1, 2],
            "type": "date-iso"
        }, {
            "targets": 6,
            "searchable": false,
            "orderable": false
        }]
    });

    // 为用户操作添加点击事件
    initUserTable();

    const btnUpdateRevisions = document.getElementById("updateRevisions");
    if (btnUpdateRevisions) {
        btnUpdateRevisions.addEventListener("click", updateRevisions);
    }
    const btnReload = document.getElementById("reload");
    if (btnReload) {
        btnReload.addEventListener("click", reload);
    }
    const btnUserOrgTypeForm = document.getElementById("userOrgTypeForm");
    if (btnUserOrgTypeForm) {
        btnUserOrgTypeForm.addEventListener("submit", updateUserOrgType);
    }
    const btnInviteUserForm = document.getElementById("inviteUserForm");
    if (btnInviteUserForm) {
        btnInviteUserForm.addEventListener("submit", inviteUser);
    }
});
