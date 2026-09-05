import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { CurrentUser } from "@/auth/controller/current-user.decorator";
import { GroupsService } from "@/groups/application/groups.service";

@ApiTags("群组")
@Controller("groups")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @ApiOperation({ summary: "获取群组列表" })
  async getGroups(@CurrentUser() user: any) {
    const groups = await this.groupsService.getGroups(user.id);

    return {
      success: true,
      message: "获取群组列表成功",
      data: groups,
    };
  }

  @Post()
  @ApiOperation({ summary: "创建群组" })
  async createGroup(
    @CurrentUser() user: any,
    @Body()
    createGroupDto: {
      name: string;
      description?: string;
      avatar?: string;
      participantIds: string[];
    },
  ) {
    const group = await this.groupsService.createGroup(user.id, createGroupDto);

    return {
      success: true,
      message: "创建群组成功",
      data: group,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "获取群组详情" })
  async getGroup(@CurrentUser() user: any, @Param("id") id: string) {
    const group = await this.groupsService.getGroupById(id, user.id);

    return {
      success: true,
      message: "获取群组详情成功",
      data: group,
    };
  }

  @Put(":id")
  @ApiOperation({ summary: "更新群组信息" })
  async updateGroup(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body()
    updateData: { name?: string; description?: string; avatar?: string },
  ) {
    const group = await this.groupsService.updateGroup(id, user.id, updateData);

    return {
      success: true,
      message: "更新群组信息成功",
      data: group,
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除群组" })
  async deleteGroup(@CurrentUser() user: any, @Param("id") id: string) {
    await this.groupsService.deleteGroup(id, user.id);

    return {
      success: true,
      message: "群组删除成功",
    };
  }

  @Post(":id/participants")
  @ApiOperation({ summary: "添加群组成员" })
  async addParticipant(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() addParticipantDto: { userId: string },
  ) {
    await this.groupsService.addParticipant(
      id,
      user.id,
      addParticipantDto.userId,
    );

    return {
      success: true,
      message: "成员已添加",
    };
  }

  @Delete(":id/participants/:userId")
  @ApiOperation({ summary: "移除群组成员" })
  async removeParticipant(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Param("userId") userId: string,
  ) {
    await this.groupsService.removeParticipant(id, user.id, userId);

    return {
      success: true,
      message: "成员已移除",
    };
  }

  @Put(":id/participants/:userId/role")
  @ApiOperation({ summary: "更改成员角色" })
  async changeRole(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Param("userId") userId: string,
    @Body() changeRoleDto: { role: "ADMIN" | "MEMBER" },
  ) {
    await this.groupsService.changeRole(
      id,
      user.id,
      userId,
      changeRoleDto.role,
    );

    return {
      success: true,
      message: "成员角色已更改",
    };
  }
}
